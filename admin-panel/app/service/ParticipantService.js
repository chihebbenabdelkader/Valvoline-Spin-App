// service/ParticipantService.js

const API_URL = 'http://localhost:5000/api/admin';

export const ParticipantService = {
    // 1. Njibou liste l participants lkol
    async getParticipants() {
        const response = await fetch(`${API_URL}/participants`);
        if (!response.ok) {
            throw new Error('Erreur réseau lors de la récupération');
        }
        return response.json();
    },

    // 2. N-fasskhou participant b l'ID mta3ou
    async deleteParticipant(id) {
        const response = await fetch(`${API_URL}/delete/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Erreur réseau lors de la suppression');
        }
        return response.json();
    }
};
