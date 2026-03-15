import { toast } from 'react-hot-toast';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    toast.error('No data to export!');
    return;
  }
  const headers = Object.keys(data[0]).filter(k => k !== '_id' && k !== '__v');
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val).replace(/"/g, '""');
      }
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success(`Exported ${filename}.csv`);
};

export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    if (url.startsWith('/api') && url !== '/api/login') {
      const token = localStorage.getItem('tb_admin_token');
      const newInit = {
        ...init,
        headers: {
          ...init?.headers,
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await originalFetch(input, newInit);
      if (res.status === 401 && token) {
        localStorage.removeItem('tb_admin_token');
        window.location.href = '/';
      }
      return res;
    }
    return originalFetch(input, init);
  };
};
