import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const QRCode = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const profileUrl = `${window.location.origin}/profile/${user?.username}`;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            <div style={{
                background: 'white',
                padding: '32px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                textAlign: 'center',
                maxWidth: '320px',
                width: '100%'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        background: `url(${user?.avatar})`,
                        backgroundSize: 'cover',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} />
                    <h2 style={{ color: '#000', margin: '0 0 4px 0', fontSize: '1.25rem' }}>{user?.fullName}</h2>
                    <p style={{ color: '#666', margin: 0 }}>@{user?.username}</p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'inline-block'
                }}>
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`}
                        alt="Profile QR Code"
                        style={{ display: 'block', width: '200px', height: '200px' }}
                    />
                </div>

                <p style={{ color: '#888', marginTop: '24px', fontSize: '0.9rem' }}>
                    Scan to view profile
                </p>
            </div>
        </div>
    );
};

export default QRCode;
