import "@/styles/globals.css"; // Bu dosyayı bir sonraki adımda oluşturacağız
import React from 'react';

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
        <body>{children}</body>
        </html>
    );
}