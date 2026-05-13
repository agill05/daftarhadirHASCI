const scriptURL = 'https://script.google.com/macros/s/AKfycbxBrP5eWT_ei9Y4--j-qgkCqHl6phmcMORYbXxx8vF3UFQwWQay0eehJEhH6G5C8hc/exec';

function setTodayDate() {
    const today = new Date();
    const yyyy = String(today.getFullYear());
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const value = `${yyyy}-${mm}-${dd}`;

    const tanggalDisplay = document.getElementById('tanggal_display');
    const tanggalHidden = document.getElementById('tanggal_hidden');

    if (tanggalDisplay) tanggalDisplay.value = value;
    if (tanggalHidden) tanggalHidden.value = value;
}

document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
});

function toggleFields() {
    const status = document.getElementById('status').value;

    const fieldHadir = document.getElementById('field-hadir');
    const fieldSakit = document.getElementById('field-sakit');
    const fieldIzin = document.getElementById('field-izin');

    fieldHadir.classList.add('hidden');
    fieldSakit.classList.add('hidden');
    fieldIzin.classList.add('hidden');

    document.getElementById('foto_selfie').required = false;
    document.getElementById('keterangan_sakit').required = false;
    document.getElementById('alasan_izin').required = false;

    if (status === 'hadir') {
        fieldHadir.classList.remove('hidden');
        document.getElementById('foto_selfie').required = true;
    } else if (status === 'sakit') {
        fieldSakit.classList.remove('hidden');
        document.getElementById('keterangan_sakit').required = true;
    } else if (status === 'izin') {
        fieldIzin.classList.remove('hidden');
        document.getElementById('alasan_izin').required = true;
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.textContent = 'Mengirim Data...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const status = formData.get('status');

    const dataPayload = {
        nama: formData.get('nama'),
        tanggal: formData.get('tanggal'),
        status: status,
        keterangan_sakit: formData.get('keterangan_sakit') || '',
        alasan_izin: formData.get('alasan_izin') || '',
        foto_base64: '',
        foto_nama: ''
    };

    if (status === 'hadir') {
        const fileInput = document.getElementById('foto_selfie');
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            dataPayload.foto_nama = file.name;
            dataPayload.foto_base64 = await getBase64(file);
        }
    }

    try {
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(dataPayload)
        });

        const result = await response.json();

        if (result.result === 'success') {
            alert('Mantap! Data kehadiran berhasil disimpan.');
            form.reset();
            setTodayDate();
            toggleFields();
        } else {
            alert('Gagal menyimpan: ' + (result.error || 'unknown error'));
        }
    } catch (error) {
        console.error('Error!', error);
        alert('Terjadi kesalahan jaringan saat mengirim data.');
    } finally {
        submitBtn.textContent = 'Kirim Absensi';
        submitBtn.disabled = false;
    }
}
