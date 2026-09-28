// Client-side controller handling drag-and-drop, preview, and API communication with backend.py
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const fileNameElem = document.getElementById('fileName');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');

let selectedFile = null;

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
    }, false);
});

dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }
    selectedFile = file;
    fileNameElem.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        previewContainer.style.display = 'flex';
        searchBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

searchBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    searchBtn.disabled = true;
    loader.style.display = 'block';
    resultsSection.style.display = 'none';

    try {
        // Sends image to backend.py, which runs matcher.c underneath
        const response = await fetch('/search', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            renderResults(data.matches);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('An error occurred while communicating with the server.');
    } finally {
        loader.style.display = 'none';
        searchBtn.disabled = false;
    }
});

function renderResults(matches) {
    resultsGrid.innerHTML = '';
    matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <img src="${match.image_url}" alt="${match.title}">
            <div class="result-info">
                <div class="result-title">${match.title}</div>
                <div class="result-meta">
                    <span>${match.source}</span>
                    <span>Score: ${match.similarity}%</span>
                </div>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
    resultsSection.style.display = 'block';
}
