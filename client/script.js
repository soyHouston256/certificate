document.addEventListener('DOMContentLoaded', () => {
  const inputFile = document.getElementById('input-file');
  const sendButton = document.querySelector('.send-form');
  let studentsOfCourse = [];

  sendButton.addEventListener('click', (e) => {
    e.preventDefault();

    const nameValue = document.querySelector('#nameOfCourse').value;
    const codeValue = document.querySelector('#nameOfCode').value;
    const dateValue = document.querySelector('#nameOfDate').value;
    const formData = {
      name: nameValue,
      code: codeValue,
      date: dateValue,
      students: studentsOfCourse,
    };

    const file = inputFile.files[0];
    if (!file) {
      alert('Por favor selecciona un archivo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(sheet['!ref']);

        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
          const student = {};
          for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
            const cellAddress = XLSX.utils.encode_cell({
              r: rowNum,
              c: colNum,
            });
            const cell = sheet[cellAddress];

            if (!cell || !cell.v) continue;

            if (colNum == 0) {
              student.name = cell.v;
            }
            if (colNum == 2) {
              student.document = cell.v;
            }
          }
          studentsOfCourse.push(student);
        }
      });

      // Aquí se envía la solicitud POST al servidor dentro de reader.onload
      sendDataToServer(formData);

      const jsonForm = JSON.stringify(formData, null, 2);
      console.log(jsonForm);
    };

    console.log(studentsOfCourse);
    reader.readAsArrayBuffer(file);
  });

  // Función para enviar los datos al servidor
  function sendDataToServer(formData) {
    console.log('Enviando datos al servidor:', formData);

    // Define la URL del endpoint al que deseas enviar los datos
    const endpointUrl = 'http://localhost:3000/generate';

    // Realiza una solicitud POST a la URL del endpoint
    fetch(endpointUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json', // Indica que estás enviando datos en formato JSON
      },
      body: JSON.stringify(formData), // Convierte los datos del formulario a formato JSON
    }).then((response) => response.blob());
    //.then((blob) => {
    // const url = window.URL.createObjectURL(blob);
    // window.open(url);
    //});
  }
});
