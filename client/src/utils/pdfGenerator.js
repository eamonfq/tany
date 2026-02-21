export async function generatePDF(elementId, filename) {
  const html2pdf = (await import('html2pdf.js')).default;
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  // Apply print mode: remove dark backgrounds for clean B&W printing
  element.classList.add('print-mode');

  const opt = {
    margin: 0.3,
    filename: filename || 'documento.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    element.classList.remove('print-mode');
  }
}
