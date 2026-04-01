/* eslint-disable @next/next/no-img-element */
'use client';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { ChartData, ChartOptions } from 'chart.js';

const Dashboard = () => {
    // 1. Les states mt3na ferghin fel lowel 9bal ma tji el data
    const [recentWinners, setRecentWinners] = useState([]);
    const [magasinsStats, setMagasinsStats] = useState([]);
    
    // States mta3 les statistiques l'fou9anin
    const [stats, setStats] = useState({
        totalParticipants: 0,
        cadeauxDistribues: 0,
        cadeauxRestants: 0,
        magasinsActifs: 0
    });

    const [lineData, setLineData] = useState<ChartData>({ labels: [], datasets: [] });
    const [pieData, setPieData] = useState<ChartData>({ labels: [], datasets: [] });

    // 2. Fonction bech tjib el data s7i7a mel API
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // ⚠️ Houni badel l'URL b'lien l'API mta3k (ex: http://localhost:3000/api/dashboard)
                const response = await fetch('http://localhost:5000/api/admin/dashboard'); 
                const data = await response.json();

                // ⚠️ Houni nsobou les données elli jewna fel state (lezem asami les variables ykounou kima fel API)
                setRecentWinners(data.recentWinners);
                setMagasinsStats(data.magasinsList || []);
                
                setStats({
                    totalParticipants: data.totalParticipants,
                    cadeauxDistribues: data.cadeauxDistribues,
                    cadeauxRestants: data.cadeauxRestants,
                    magasinsActifs: data.magasinsActifs
                });

                // T3abi e-chart mta3 l'évolution
                setLineData({
                    labels: data.lineChart.labels, // ex: ['Lundi', 'Mardi', ...]
                    datasets: [
                        {
                            label: 'Nombre de Participations',
                            data: data.lineChart.values, // ex: [120, 150, ...]
                            fill: false,
                            backgroundColor: '#00bb7e',
                            borderColor: '#00bb7e',
                            tension: 0.4
                        }
                    ]
                });

                // T3abi e-chart mta3 l'doughnut
                setPieData({
                    labels: data.pieChart.labels, // ex: ['Casquettes', 'T-Shirts', ...]
                    datasets: [
                        {
                            data: data.pieChart.values, // ex: [50, 25, ...]
                            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA'],
                            hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#4DD0E1']
                        }
                    ]
                });

            } catch (error) {
                console.error("Famma mochkel fil fetch mta3 data:", error);
            }
        };

        fetchDashboardData();
    }, []); // El tableau feragh ma3neha tetlansa mara barka awel ma tet7al el page

    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const [pieOptions, setPieOptions] = useState<ChartOptions>({});
    const { layoutConfig } = useContext(LayoutContext);

    const applyLightTheme = () => { /* ... mchit nkhali fih kima houwa ... */ };
    const applyDarkTheme = () => { /* ... kima houwa zeda ... */ };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    return (
        <div className="grid">
            {/* --- CARTE 1 : Total Participants --- */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Total Participants</span>
                            {/* Nbadlou el r9am el fixe bel state mta3na */}
                            <div className="text-900 font-medium text-xl">{stats.totalParticipants}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-blue-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CARTE 2 : Cadeaux Distribués --- */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Cadeaux Distribués</span>
                            <div className="text-900 font-medium text-xl">{stats.cadeauxDistribues}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-gift text-green-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CARTE 3 : Cadeaux Restants (Stock) --- */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Cadeaux Restants</span>
                            <div className="text-900 font-medium text-xl">{stats.cadeauxRestants}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-box text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CARTE 4 : Magasins Actifs --- */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Magasins Actifs</span>
                            <div className="text-900 font-medium text-xl">{stats.magasinsActifs}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-map-marker text-purple-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABLEAU : Derniers Gagnants --- */}
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Derniers Gagnants</h5>
                    <DataTable value={recentWinners} rows={5} paginator responsiveLayout="scroll">
                        <Column field="name" header="Nom & Prénom" sortable style={{ width: '30%' }} />
                        <Column field="phone" header="Téléphone" style={{ width: '25%' }} />
                        <Column field="prize" header="Cadeau Gagné" sortable style={{ width: '25%' }} />
                        <Column field="date" header="Date & Heure" sortable style={{ width: '20%' }} />
                    </DataTable>
                </div>
                <div className="card">
                    <h5>Classement des Magasins</h5>
                    <DataTable value={magasinsStats} rows={5} paginator responsiveLayout="scroll">
                        <Column field="magasin" header="Nom du Magasin" sortable style={{ width: '70%' }} />
                        <Column field="count" header="Participations" sortable style={{ width: '30%' }} />
                    </DataTable>
                </div>
            </div>

            {/* --- COLONNE DROITE : Graphiques --- */}
            <div className="col-12 xl:col-6">
                <div className="card">
                    <h5>Évolution des Participations</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                </div>

                <div className="card flex flex-column align-items-center">
                    <h5 className="align-self-start">Répartition des Cadeaux</h5>
                    <Chart type="doughnut" data={pieData} options={pieOptions} style={{ width: '50%' }} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;