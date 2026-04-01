// service/PrizeService.js
const API_URL = 'http://localhost:5000/api/prizes';

export const PrizeService = {
    async getPrizes() {
        const response = await fetch(API_URL);
        return response.json();
    },

    // Nabaathou FormData (Fih l ketba w l taswira)
    async createPrize(formData) {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    },

    async updatePrize(id, formData) {
        const response = await fetch(`${API_URL}/update/${id}`, {
            method: 'PUT',
            body: formData
        });
        return response.json();
    },

    async deletePrize(id) {
        const response = await fetch(`${API_URL}/delete/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};
