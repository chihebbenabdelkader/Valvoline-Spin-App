'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { PrizeService } from '../../service/PrizeService';
import DemoWheel from '../../components/DemoWheel';

export default function SettingsPage() {
    const [prizes, setPrizes] = useState([]);
    const [prizeDialog, setPrizeDialog] = useState(false);
    const [demoDialog, setDemoDialog] = useState(false);

    const [prize, setPrize] = useState({
        name: '',
        stockInitial: 0,
        stockRestant: 0,
        maxParJour: null,
        heureDebut: '',
        heureFin: '',
        dateSpecifique: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);

    const fetchPrizes = async () => {
        setLoading(true);
        try {
            const res = await PrizeService.getPrizes();
            if (res.success) setPrizes(res.data);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les cadeaux.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrizes();
    }, []);

    const openNew = () => {
        setPrize({ name: '', stockInitial: 0, stockRestant: 0, maxParJour: null, heureDebut: '', heureFin: '', dateSpecifique: '' });
        setSelectedFile(null);
        setImagePreview(null);
        setPrizeDialog(true);
    };

    const editPrize = (cadeau) => {
        setPrize({ ...cadeau });
        setSelectedFile(null);
        setImagePreview(cadeau.image ? `http://localhost:5000/${cadeau.image}` : null);
        setPrizeDialog(true);
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const savePrize = async () => {
        if (!prize.name.trim()) {
            toast.current.show({ severity: 'warn', summary: 'Attention', detail: 'Le nom est obligatoire.' });
            return;
        }

        const formData = new FormData();
        formData.append('name', prize.name);

        const initialValue = prize.stockInitial ? prize.stockInitial.toString() : '0';
        formData.append('stockInitial', initialValue);

        if (prize._id) {
            const restantValue = prize.stockRestant !== undefined ? prize.stockRestant.toString() : initialValue;
            formData.append('stockRestant', restantValue);
        } else {
            formData.append('stockRestant', initialValue);
        }

        if (prize.maxParJour !== null) formData.append('maxParJour', prize.maxParJour);
        if (prize.heureDebut) formData.append('heureDebut', prize.heureDebut);
        if (prize.heureFin) formData.append('heureFin', prize.heureFin);

        // 👈 تنظيف التواريخ من الخانات الفارغة قبل ما نبعثوهم للباكاند
        const cleanDates = prize.dateSpecifique
            ? prize.dateSpecifique
                  .split(',')
                  .map((d) => d.trim())
                  .filter((d) => d !== '')
                  .join(',')
            : '';
        if (cleanDates) formData.append('dateSpecifique', cleanDates);

        if (selectedFile) formData.append('image', selectedFile);

        try {
            let res;
            if (prize._id) {
                res = await PrizeService.updatePrize(prize._id, formData);
            } else {
                res = await PrizeService.createPrize(formData);
            }

            if (res.success) {
                toast.current.show({ severity: 'success', summary: 'Succès', detail: res.message });
                setPrizeDialog(false);
                fetchPrizes();
            } else {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: res.message });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la sauvegarde.' });
        }
    };

    // 👇 1. فونكسيونات باش نتحكمو في قائمة التواريخ
    const datesArray = prize.dateSpecifique ? prize.dateSpecifique.split(',') : [''];

    const handleDateChange = (index, value) => {
        const newDates = [...datesArray];
        newDates[index] = value;
        setPrize({ ...prize, dateSpecifique: newDates.join(',') });
    };

    const addDateField = () => {
        const newDates = [...datesArray, ''];
        setPrize({ ...prize, dateSpecifique: newDates.join(',') });
    };

    const removeDateField = (index) => {
        const newDates = datesArray.filter((_, i) => i !== index);
        setPrize({ ...prize, dateSpecifique: newDates.length > 0 ? newDates.join(',') : '' });
    };

    // --- TEMPLATES POUR LE TABLEAU ---
    const stockInitialTemplate = (rowData) => {
        return <span className="font-bold text-blue-500">{rowData.stockInitial}</span>;
    };

    const stockRestantTemplate = (rowData) => {
        const outOfStock = rowData.stockRestant <= 0;
        return <Tag value={outOfStock ? 'Épuisé (0)' : `${rowData.stockRestant} restant(s)`} severity={outOfStock ? 'danger' : 'success'} />;
    };

    const conditionsTemplate = (rowData) => {
        return (
            <div className="flex flex-column gap-1 text-sm">
                {rowData.dateSpecifique && (
                    <span className="text-pink-500 font-bold">
                        <i className="pi pi-calendar mr-1"></i>
                        {rowData.dateSpecifique}
                    </span>
                )}
                {rowData.maxParJour > 0 && (
                    <span className="text-orange-500 font-bold">
                        <i className="pi pi-chart-pie mr-1"></i>Max: {rowData.maxParJour}/j
                    </span>
                )}
                {rowData.heureDebut && (
                    <span className="text-green-500 font-bold">
                        <i className="pi pi-clock mr-1"></i>
                        {rowData.heureDebut} ➔ {rowData.heureFin}
                    </span>
                )}
                {!rowData.dateSpecifique && !rowData.maxParJour && !rowData.heureDebut && <span className="text-500">Aucune (Toujours dispo)</span>}
            </div>
        );
    };

    const deletePrize = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce cadeau ?')) {
            try {
                const res = await PrizeService.deletePrize(id);
                if (res.success) {
                    toast.current.show({ severity: 'success', summary: 'Succès', detail: 'Cadeau supprimé.' });
                    fetchPrizes();
                }
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur de suppression.' });
            }
        }
    };

    const imageBodyTemplate = (rowData) => {
        return rowData.image ? <img src={`http://localhost:5000/${rowData.image}`} alt={rowData.name} className="shadow-2 border-round" style={{ width: '60px', height: '60px', objectFit: 'cover' }} /> : <span className="text-500">Pas d'image</span>;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="info" onClick={() => editPrize(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => deletePrize(rowData._id)} />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return <Button label="Nouveau Cadeau" icon="pi pi-plus" severity="success" onClick={openNew} />;
    };

    const rightToolbarTemplate = () => {
        return <Button label="Aperçu (Live Demo)" icon="pi pi-play" severity="help" onClick={() => setDemoDialog(true)} />;
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h4 className="text-primary font-bold mb-4">🎁 Paramètres de la Roue (Cadeaux)</h4>
                    <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

                    <DataTable value={prizes} paginator rows={10} loading={loading} emptyMessage="Aucun cadeau configuré." stripedRows responsiveLayout="scroll">
                        <Column header="Image" body={imageBodyTemplate}></Column>
                        <Column field="name" header="Nom du Cadeau" sortable style={{ minWidth: '15rem' }}></Column>
                        <Column field="stockInitial" header="Stock Initial" body={stockInitialTemplate} sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="stockRestant" header="Stock Restant" body={stockRestantTemplate} sortable style={{ minWidth: '10rem' }}></Column>
                        <Column header="Conditions (Smart)" body={conditionsTemplate} style={{ minWidth: '15rem' }}></Column>
                        <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                </div>
            </div>

            {/* DIALOG AJOUT / MODIFICATION */}
            <Dialog visible={prizeDialog} style={{ width: '600px' }} header="Détails & Conditions du Cadeau" modal className="p-fluid" onHide={() => setPrizeDialog(false)}>
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Nom du Cadeau
                    </label>
                    <InputText id="name" value={prize.name} onChange={(e) => setPrize({ ...prize, name: e.target.value })} required autoFocus />
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="stockInitial" className="font-bold">
                            Stock Initial Total
                        </label>
                        <InputNumber id="stockInitial" value={prize.stockInitial} onValueChange={(e) => setPrize({ ...prize, stockInitial: e.value })} min={0} showButtons />
                    </div>
                    <div className="field col">
                        <label htmlFor="maxParJour" className="font-bold text-orange-500">
                            Max par Jour (Limite)
                        </label>
                        <InputNumber id="maxParJour" value={prize.maxParJour} onValueChange={(e) => setPrize({ ...prize, maxParJour: e.value })} placeholder="Illimité" min={0} showButtons />
                    </div>
                </div>

                {/* 👇 2. الديزاين الجديد متع التواريخ المتعددة */}
                <div className="field border-top-1 border-300 pt-3 mt-2">
                    <label className="font-bold text-pink-500 block mb-2">Dates Spécifiques (Ex: TV 42)</label>

                    {datesArray.map((dateStr, index) => (
                        <div key={index} className="flex align-items-center gap-2 mb-2">
                            <InputText type="date" value={dateStr} onChange={(e) => handleDateChange(index, e.target.value)} className="flex-1" />

                            {/* بوتون الإضافة يظهر كان في أخر خانة */}
                            {index === datesArray.length - 1 && <Button icon="pi pi-plus" type="button" severity="success" onClick={addDateField} tooltip="Ajouter une autre date" />}

                            {/* بوتون الفسخان يظهر كان فما أكثر من تاريخ */}
                            {datesArray.length > 1 && <Button icon="pi pi-trash" type="button" severity="danger" outlined onClick={() => removeDateField(index)} tooltip="Supprimer cette date" />}
                        </div>
                    ))}
                    <small className="text-500 block mt-1">Laissez vide si le cadeau est disponible tous les jours sans exception.</small>
                </div>

                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="heureDebut" className="font-bold text-green-500">
                            Heure de Début
                        </label>
                        <InputText id="heureDebut" type="time" value={prize.heureDebut || ''} onChange={(e) => setPrize({ ...prize, heureDebut: e.target.value })} />
                    </div>
                    <div className="field col">
                        <label htmlFor="heureFin" className="font-bold text-green-500">
                            Heure de Fin
                        </label>
                        <InputText id="heureFin" type="time" value={prize.heureFin || ''} onChange={(e) => setPrize({ ...prize, heureFin: e.target.value })} />
                    </div>
                </div>

                <div className="field border-top-1 border-300 pt-3 mt-2">
                    <label className="font-bold">Image du Cadeau</label>
                    <div className="border-2 border-dashed border-gray-300 border-round p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('fileUpload').click()}>
                        <i className="pi pi-image text-4xl text-gray-400 mb-2"></i>
                        <p className="m-0 text-gray-500 text-sm">Cliquez pour choisir une image</p>
                        <input id="fileUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
                    </div>
                    {imagePreview && (
                        <div className="mt-3 text-center">
                            <img src={imagePreview} alt="Preview" className="shadow-2 border-round" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        </div>
                    )}
                </div>

                <div className="flex justify-content-end gap-2 mt-4">
                    <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setPrizeDialog(false)} />
                    <Button label="Enregistrer" icon="pi pi-check" onClick={savePrize} />
                </div>
            </Dialog>

            {/* DIALOG LIVE DEMO */}
            <Dialog visible={demoDialog} style={{ width: '900px', height: '900px' }} header="Aperçu de la Roue" onHide={() => setDemoDialog(false)} modal>
                <DemoWheel prizes={prizes} />
            </Dialog>
        </div>
    );
}
