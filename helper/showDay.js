module.exports = function showDay() {
    const naw = new Date().getDay()
    let day = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return day[naw]
}