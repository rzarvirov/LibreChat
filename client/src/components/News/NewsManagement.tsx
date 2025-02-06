import { useState, useEffect } from 'react';
import { useLocalize } from '~/hooks';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

interface News {
  _id: string;
  title: {
    en: string;
    ru: string;
  };
  content: {
    en: string;
    ru: string;
  };
  active: boolean;
  priority: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export default function NewsManagement() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const localize = useLocalize();

  const [formData, setFormData] = useState({
    titleEn: '',
    titleRu: '',
    contentEn: '',
    contentRu: '',
    active: true,
    priority: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const dashboardPassword = localStorage.getItem('dashboard_password');
      console.log('Using dashboard password:', dashboardPassword); // Debug log

      const response = await fetch('/api/news/all', {
        headers: {
          'x-dashboard-password': dashboardPassword || ''
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch news');
      }
      const data = await response.json();
      setNews(data); // The response is already the news array
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load news';
      setError(errorMessage);
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const newsData = {
      title: {
        en: formData.titleEn,
        ru: formData.titleRu,
      },
      content: {
        en: formData.contentEn,
        ru: formData.contentRu,
      },
      active: formData.active,
      priority: formData.priority,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    try {
      const dashboardPassword = localStorage.getItem('dashboard_password');
      console.log('Using dashboard password:', dashboardPassword); // Debug log

      const url = editingNews ? `/api/news/${editingNews._id}` : '/api/news';
      const method = editingNews ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-dashboard-password': dashboardPassword || ''
        },
        body: JSON.stringify(newsData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save news');
      }

      console.log('Server response:', data); // Debug log

      setSuccess(editingNews ? 'News updated successfully' : 'News created successfully');
      setIsFormVisible(false);
      setEditingNews(null);
      resetForm();
      fetchNews();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save news';
      setError(errorMessage);
      console.error('Error saving news:', err);
    }
  };

  const handleEdit = (item: News) => {
    setEditingNews(item);
    setFormData({
      titleEn: item.title.en,
      titleRu: item.title.ru,
      contentEn: item.content.en,
      contentRu: item.content.ru,
      active: item.active,
      priority: item.priority,
      startDate: item.startDate.split('T')[0],
      endDate: item.endDate.split('T')[0],
    });
    setIsFormVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          'x-dashboard-password': localStorage.getItem('dashboard_password') || ''
        }
      });

      if (!response.ok) throw new Error('Failed to delete news');

      setSuccess('News deleted successfully');
      fetchNews();
    } catch (err) {
      setError('Failed to delete news');
      console.error('Error deleting news:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleRu: '',
      contentEn: '',
      contentRu: '',
      active: true,
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900/50 dark:text-green-200">
          {success}
        </div>
      )}

      <div className="mb-4 flex justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">News Management</h2>
        <button
          onClick={() => {
            setIsFormVisible(true);
            setEditingNews(null);
            resetForm();
          }}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add News
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingNews ? 'Edit News' : 'Add News'}
            </h3>
            <button
              onClick={() => {
                setIsFormVisible(false);
                setEditingNews(null);
              }}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Title (Russian)
                </label>
                <input
                  type="text"
                  value={formData.titleRu}
                  onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Content (English)
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Content (Russian)
                </label>
                <textarea
                  value={formData.contentRu}
                  onChange={(e) => setFormData({ ...formData, contentRu: e.target.value })}
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-200">Active</label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {editingNews ? 'Update' : 'Create'} News
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Priority
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Dates
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {news.map((item) => (
              <tr key={item._id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title.en}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.title.ru}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      item.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {item.priority}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(item.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="mr-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 