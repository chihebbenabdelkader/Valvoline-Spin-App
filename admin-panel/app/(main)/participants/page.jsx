'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
// 👇 Importina l service jdid houni
import { ParticipantService } from '../../service/ParticipantService'; // Baddel l chemin 7asb l blasa win sayyabtou

export default function ParticipantsPage() {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    // 👇 Fonction Fetch wallat andhaf w tekhdem bel async/await
    const fetchParticipants = async () => {
        setLoading(true);
        try {
            const response = await ParticipantService.getParticipants();
            if (response.success) {
                setParticipants(response.data);
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur serveur.', life: 3000 });
            }
        } catch (error) {
            console.error('Erreur Fetch:', error);
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Impossible de joindre l'API.", life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    // 🎨 Design mta3 l Cadeau
    const prizeBodyTemplate = (rowData) => {
        const estEnAttente = rowData.cadeau === 'En attente' || !rowData.cadeau;
        return <Tag value={rowData.cadeau || 'En attente'} severity={estEnAttente ? 'warning' : 'success'} />;
    };

    // 🎨 Formatage Date
    const dateBodyTemplate = (rowData) => {
        if (!rowData.createdAt) return '-';
        return new Date(rowData.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 🗑️ Fonction Delete (Testa3mel l Service jdid)
    const deleteParticipant = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce participant ?')) {
            try {
                const response = await ParticipantService.deleteParticipant(id);
                if (response.success) {
                    toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Participant supprimé !', life: 3000 });
                    fetchParticipants();
                } else {
                    toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur suppression', life: 3000 });
                }
            } catch (error) {
                console.error('Erreur Delete:', error);
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: "Impossible de joindre l'API.", life: 3000 });
            }
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-trash" rounded outlined severity="danger" aria-label="Supprimer" onClick={() => deleteParticipant(rowData._id)} />
            </div>
        );
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h4 className="text-primary font-bold mb-4">🏆 Liste des Participants - Valvoline</h4>

                    <DataTable value={participants} paginator rows={10} dataKey="_id" loading={loading} emptyMessage="Aucun participant trouvé." responsiveLayout="scroll" stripedRows>
                        <Column field="nom" header="Nom & Prénom" sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="telephone" header="Téléphone" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="magasin" header="Magasin" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="ville" header="Ville" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="cadeau" header="Cadeau Gagné" body={prizeBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="createdAt" header="Date" body={dateBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                        <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '8rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
