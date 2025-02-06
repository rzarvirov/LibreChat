import { useState, useEffect } from 'react';
import { useLocalize } from '~/hooks';

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
  endDate?: string;
  createdAt: string;
}

const NewsManagement = () => {
  const localize = useLocalize();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [title, setTitle] = useState({ en: '', ru: '' });
  const [content, setContent] = useState({ en: '', ru: '' });
  const [active, setActive] = useState(true);
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news/all', {
        headers: {
          'x-dashboard-password': localStorage.getItem('dashboard_password') || ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const resetForm = () => {
    setEditingNews(null);
    setTitle({ en: '', ru: '' });
    setContent({ en: '', ru: '' });
    setActive(true);
    setPriority(0);
    setStartDate('');
    setEndDate('');
    setError('');
    setSuccess('');
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setTitle(newsItem.title);
    setContent(newsItem.content);
    setActive(newsItem.active);
    setPriority(newsItem.priority);
    setStartDate(new Date(newsItem.startDate).toISOString().split('T')[0]);
    if (newsItem.endDate) {
      setEndDate(new Date(newsItem.endDate).toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        title,
        content,
        active,
        priority,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined
      };

      const url = editingNews 
        ? `/api/news/${editingNews._id}`
        : '/api/news';

      const response = await fetch(url, {
        method: editingNews ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dashboard-password': localStorage.getItem('dashboard_password') || ''
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save news');

      setSuccess(editingNews ? 'News updated successfully' : 'News created successfully');
      resetForm();
      fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;

    try {
      setLoading(true);
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
      setError(err instanceof Error ? err.message : 'Failed to delete news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">News Management</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={title.en}
                  onChange={(e) => setTitle({ ...title, en: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Russian Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Russian)
                </label>
                <input
                  type="text"
                  value={title.ru}
                  onChange={(e) => setTitle({ ...title, ru: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* English Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (English)
                </label>
                <textarea
                  value={content.en}
                  onChange={(e) => setContent({ ...content, en: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Russian Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Russian)
                </label>
                <textarea
                  value={content.ru}
                  onChange={(e) => setContent({ ...content, ru: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Submit and Cancel Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : editingNews ? 'Update News' : 'Create News'}
              </button>
              {editingNews && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* News List */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">News List</h3>
            {news.map((item) => (
              <div
                key={item._id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">
                      {item.title.en} / {item.title.ru}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Priority: {item.priority} | Status: {item.active ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Start: {new Date(item.startDate).toLocaleDateString()}
                      {item.endDate && ` | End: ${new Date(item.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">{item.content.en}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{item.content.ru}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsManagement; 