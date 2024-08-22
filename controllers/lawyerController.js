const Lawyer = require('../models/lawyerModel');
const exceljs = require('exceljs');

exports.getAllLawyers = async (req, res) => {
  const { search } = req.query;
  let query = {};

  if (search) {
    query = {
      $or: [
        { name: new RegExp(search, 'i') },
        { caseName: new RegExp(search, 'i') }
      ]
    };
  }

  try {
    const lawyers = await Lawyer.find(query).sort({ createdAt: -1 });

    // Formatar a data no servidor
    const formattedLawyers = lawyers.map(lawyer => {
      return {
        ...lawyer._doc,
        caseDateFormatted: lawyer.caseDate.toLocaleDateString('pt-BR'),
        createdAtFormatted: lawyer.createdAt.toLocaleDateString('pt-BR')
      };
    });

    res.render('lawyers', { title: 'Lista de Advogados', lawyers: formattedLawyers });
  } catch (err) {
    res.status(500).send('Erro ao buscar advogados');
  }
};

exports.createLawyer = async (req, res) => {
  const { name, oab, phone, email, caseName, caseDate } = req.body;

  try {
    // Converter a data do processo para a data local antes de salvar
    const processDate = new Date(caseDate);
    processDate.setMinutes(processDate.getMinutes() + processDate.getTimezoneOffset());

    const newLawyer = new Lawyer({ 
      name, 
      oab, 
      phone, 
      email, 
      caseName, 
      caseDate: processDate 
    });
    await newLawyer.save();
    res.redirect('/lawyers');
  } catch (err) {
    res.status(500).send('Erro ao cadastrar advogado');
  }
};

exports.deleteLawyer = async (req, res) => {
  try {
    await Lawyer.findByIdAndDelete(req.params.id);
    res.redirect('/lawyers');
  } catch (err) {
    res.status(500).send('Erro ao deletar advogado');
  }
};

exports.exportLawyers = async (req, res) => {
  const { date } = req.query;

  try {
    // Ajustar a data para o início e fim do dia no horário local
    const selectedDate = new Date(date + 'T00:00:00.000Z');
    const startOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate(), 23, 59, 59, 999));


    console.log("Start of day:", startOfDay.toISOString());
    console.log("End of day:", endOfDay.toISOString());

    // Filtrar advogados que foram criados exatamente no dia selecionado
    const lawyers = await Lawyer.find({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    console.log("Advogados filtrados:", lawyers.length);

    if (lawyers.length === 0) {
      console.log("Nenhum advogado encontrado para a data selecionada.");
      res.status(404).send('Nenhum advogado encontrado para a data selecionada.');
      return;
    }

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Lawyers');

    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'OAB', key: 'oab', width: 20 },
      { header: 'Telefone', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Nome do Processo', key: 'caseName', width: 30 },
      { header: 'Data do Processo', key: 'caseDate', width: 20 }
    ];

    lawyers.forEach((lawyer) => {
      worksheet.addRow({
        name: lawyer.name,
        oab: lawyer.oab,
        phone: lawyer.phone,
        email: lawyer.email,
        caseName: lawyer.caseName,
        caseDate: lawyer.caseDate.toLocaleDateString('pt-BR')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=lawyers_${date}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Erro ao exportar advogados:', err);
    res.status(500).send('Erro ao exportar advogados');
  }
};







