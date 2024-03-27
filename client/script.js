document.addEventListener('DOMContentLoaded', () => {
  const inputFile = document.getElementById('input-file');
  const sendButton = document.querySelector('.send-form');
  const inputImage = document.getElementById('input-image');
  let studentsOfCourse = [];
  let background = null;

  sendButton.addEventListener('click', (e) => {
    e.preventDefault();

    const codeValue = document.querySelector('#nameOfCode').value;
    const formData = {
      code: codeValue,
      background: background,
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

  inputImage.addEventListener('change', (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];

    if (!file) {
      alert('Por favor selecciona un archivo de imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    sendImageToServer(formData);
  });

  // Función para enviar los datos al servidor
  function sendDataToServer(formData) {
    console.log('Enviando datos al servidor:', formData);

    const endpointUrl = 'http://localhost:3000/generate';

    fetch(endpointUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const resultDiv = document.querySelector('.result'); // Seleccionamos el div de resultado
        const resultUl = resultDiv.querySelector('ul'); // Seleccionamos la lista dentro del div de resultado

        // Limpiamos el contenido anterior
        resultUl.innerHTML = '';

        // Iteramos sobre los enlaces generados y los agregamos como elementos de lista
        data.forEach((link) => {
          const listItem = document.createElement('li');
          const linkElement = document.createElement('a');
          linkElement.href = link;
          linkElement.textContent = link;
          listItem.appendChild(linkElement);
          resultUl.appendChild(listItem);
        });
      })
      .catch((error) => {
        console.error('Error al procesar la respuesta:', error);
      });
  }

  function sendImageToServer(formData) {
    console.log('Enviando imagen al servidor:', formData);

    // Define la URL del endpoint al que deseas enviar los datos
    const endpointUrl = 'http://localhost:3000/upload';

    // Realiza una solicitud POST a la URL del endpoint
    fetch(endpointUrl, {
      method: 'post',
      body: formData, // Convierte los datos del formulario a formato JSON
    })
      .then((response) => response.json())
      .then((data) => {
        background = data.background;
        console.log('Respuesta del servidor:', data.background);
        console.log(background);
      })
      .catch((error) => {
        console.error('Error al enviar la imagen:', error);
      });
    //.then((blob) => {
    // const url = window.URL.createObjectURL(blob);
    // window.open(url);
    //});
  }
});
