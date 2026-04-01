/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useRouter } from 'next/navigation';
import { Menu } from 'primereact/menu';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const [adminName, setAdminName] = useState('Admin');
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const menuRef = useRef<Menu>(null);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    // قرائة الاسم عند تحميل الصفحة
    useEffect(() => {
        const name = localStorage.getItem('admin_name');
        if (name) setAdminName(name);
    }, []);

    // فونكسيون الخروج (Logout)
    const logout = () => {
        // فسخ الـ Cookie (نفس الاسم اللي استعملناه في Login)
        document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // فسخ البيانات من الـ LocalStorage
        localStorage.removeItem('admin_name');
        // الرجوع لصفحة اللوجين
        router.push('/auth/login');
    };

    // عناصر المنيو المنسدلة
    const menuItems = [
        {
            label: 'Paramètres',
            icon: 'pi pi-cog'
        },
        {
            separator: true
        },
        {
            label: 'Déconnexion',
            icon: 'pi pi-power-off',
            command: logout // تنفيذ الخروج
        }
    ];

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src="/layout/images/Asset 8logo c.png" alt="Afrilub Logo" style={{ height: '50px' }} />
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                
                {/* 1. جملة الترحيب الشخصية */}
                <span className="align-self-center mr-3 font-medium hidden md:block">
                    Bienvenue, Mr. <span style={{ color: '#29a849', fontWeight: 'bold' }}>{adminName}</span>
                </span>

                {/* 2. المنيو المنسدل */}
                <Menu model={menuItems} popup ref={menuRef} id="popup_menu_user" />
                
                <button 
                    type="button" 
                    className="p-link layout-topbar-button" 
                    onClick={(event) => menuRef.current?.toggle(event)}
                >
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;