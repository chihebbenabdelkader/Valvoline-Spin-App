/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox'; 
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

           if (data.success) {
          const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
          document.cookie = `admin_token=${data.token}; path=/; max-age=${maxAge}`;
         
            // 👈 نزيدو هذي باش نخزنو الاسم واللقب
             localStorage.setItem('admin_name', `${data.user.prenom} ${data.user.nom}`);
    
        router.push('/');
        } else {
                setError(data.message || "Erreur de connexion");
            }
        } catch (err) {
            setError("Serveur inaccessible");
        }
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen" style={{ width: '100vw' }}>
            
            {/* 👈 التغيير 1: كبرنا في الـ size متاع الـ Checkbox باش يظهر أخضر بلقدا */}
            <style>{`
                .p-checkbox .p-checkbox-box.p-highlight {
                    background-color: #29a849 !important;
                    border-color: #29a849 !important;
                }
                .p-inputtext:focus {
                    border-color: #29a849 !important;
                    box-shadow: 0 0 0 0.2rem rgba(41, 168, 73, 0.25) !important;
                }
                .p-password-input:focus {
                    border-color: #29a849 !important;
                    box-shadow: 0 0 0 0.2rem rgba(41, 168, 73, 0.25) !important;
                }
            `}</style>

            <div className="flex flex-column align-items-center justify-content-center w-full">
                
                {/* 👈 التغيير 2: اللوڨو كبرناه باستعمال Inline Style (width) و Tailwind classes */}
                <img 
                    src="/layout/images/Asset 8logo c.png" 
                    alt="afrilub logo" 
                    className="mb-6 shrink-0" 
                    style={{ width: '15rem', height: 'auto', objectFit: 'contain' }} // <--- كبرنا العرض من 6rem لـ 15rem
                />
                
                {/* 👈 التغيير 3: الـ Gradient متع الـ Border رديناه بالأخضر (#29a849) */}
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, #29a849 10%, rgba(41, 168, 73, 0) 30%)', width: '90%', maxWidth: '480px' }}>
                    <div className="surface-card py-8 px-5 sm:px-8 w-full" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Bienvenue !</div>
                            <span className="text-600 font-medium">Connectez-vous pour continuer</span>
                        </div>

                        {error && <div className="text-red-500 text-center mb-3 font-bold bg-red-50 p-2 rounded">{error}</div>}

                        <div className="p-fluid"> 
                            <div className="field mb-5">
                                <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">Username / Email</label>
                                <InputText 
                                    id="email1" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Email address" 
                                    className="w-full" 
                                    style={{ padding: '1rem', borderRadius: '8px' }} 
                                />
                            </div>

                            <div className="field mb-5">
                                <label htmlFor="pw1" className="block text-900 font-medium text-xl mb-2">Mot de passe</label>
                                <Password 
                                    inputId="pw1" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Password" 
                                    toggleMask 
                                    className="w-full" 
                                    inputClassName="w-full p-3"
                                    inputStyle={{ borderRadius: '8px' }}
                                />
                            </div>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5 flex-wrap">
                                <div className="flex align-items-center">
                                    <Checkbox 
                                        inputId="rememberme1" 
                                        checked={rememberMe} 
                                        onChange={(e: CheckboxChangeEvent) => setRememberMe(e.checked ?? false)} 
                                        className="mr-2" 
                                    />
                                    <label htmlFor="rememberme1" style={{ cursor: 'pointer' }}>Se souvenir de moi</label>
                                </div>
                                {/* 👈 التغيير 4: الـ Link متع "نسيت الباسورد" لوناه بالأخضر (#29a849) */}
                                <a className="font-medium no-underline text-right cursor-pointer" style={{ color: '#29a849', fontSize: '1rem' }}>Mot de passe oublié ?</a>
                            </div>

                            {/* 👈 التغيير 5: الـ Button رديناه أخضر (#29a849) وجوّو باهي */}
                            <Button 
                                label="Sign In" 
                                className="w-full p-3 text-xl border-none" 
                                style={{ backgroundColor: '#29a849', color: 'white', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                onClick={handleLogin}
                            ></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;