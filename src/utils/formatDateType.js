export function formatNevoboDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('nl-NL', options).replace('.', ''); // Remove period
};

export const formatDateTime = (dateString) => {
    const options = {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Date(dateString)
        .toLocaleString('nl-NL', options)
        .replace(',', '');
};

export const formatDateTimeExtended = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date)) {
        return 'Ongeldige datum';
    }

    const options = {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric', // Add this for safety
    };

    return date
        .toLocaleString('nl-NL', options)
        .replace(',', '')
        .replace(/\s\d{4}$/, ''); // Optionally remove the year again if not needed
};


export const formatTime = (date) => {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
    };
    return new Date(date).toLocaleString('nl-NL', options);
  };