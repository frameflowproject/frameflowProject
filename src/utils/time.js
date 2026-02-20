export const formatTimeAgo = (date) => {
    if (!date) return 'just now';

    const now = new Date();
    const past = new Date(date);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        if (minutes === 1) return 'one minute ago';
        if (minutes === 2) return 'two minutes ago';
        if (minutes === 3) return 'three minutes ago';
        return `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        if (hours === 1) return 'one hour ago';
        if (hours === 2) return 'two hours ago';
        if (hours === 3) return 'three hours ago';
        return `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        if (days === 1) return 'one day ago';
        return `${days} days ago`;
    }

    return past.toLocaleDateString();
};
