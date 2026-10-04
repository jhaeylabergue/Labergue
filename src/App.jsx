import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Boxes,
  CirclePlus,
  LoaderCircle,
  LogOut,
  PackageOpen,
  Pencil,
  RotateCw,
  Trash2,
  X,
} from 'lucide-react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import {
  ACCESS_TOKEN_KEY,
  api,
  getErrorMessage,
  REFRESH_TOKEN_KEY,
} from './api.js';

function ProtectedRoute({ children }) {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
    ? children
    : <Navigate to="/login" replace />;
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) navigate('/products', { replace: true });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/login', { email, password });
      if (!data.access_token || !data.refresh_token) {
        throw new Error('The API response did not include the expected tokens.');
      }
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      navigate('/products', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-intro">
        <a className="brand brand-light" href="/login" aria-label="Stockroom home">
          <span className="brand-mark"><Boxes size={19} strokeWidth={2.2} /></span>
          STOCKROOM
        </a>
        <div className="intro-copy">
          <p className="eyebrow">PRODUCT OPERATIONS</p>
          <h1>Good stock.<br />Clear picture.</h1>
          <p className="intro-description">One calm place to keep your products in order.</p>
        </div>
        <span className="intro-index">01 / INVENTORY</span>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="eyebrow eyebrow-muted">WELCOME BACK</p>
          <h2>Sign in to Stockroom</h2>
          <p className="form-intro">Use your administrator account to continue.</p>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email address</label>
            <input
              autoComplete="username"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <label htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
            <button className="button button-primary login-submit" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowUpRight size={17} />}
            </button>
          </form>
          <p className="login-footnote">Access is limited to your configured administrator account.</p>
        </div>
      </section>
    </main>
  );
}

const emptyProduct = { product_name: '', description: '', price: '', quantity: '' };

function ProductForm({ product, onClose, onSaved }) {
  const [values, setValues] = useState({ ...emptyProduct, ...product });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(product?.id);

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const price = Number(values.price);
    const quantity = Number(values.quantity);
    if (!values.product_name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (values.price === '' || !Number.isFinite(price) || price < 0) {
      setError('Price must be a number greater than or equal to zero.');
      return;
    }
    if (values.quantity === '' || !Number.isInteger(quantity) || quantity < 0) {
      setError('Quantity must be a whole number greater than or equal to zero.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product_name: values.product_name.trim(),
        description: values.description.trim(),
        price,
        quantity,
      };
      if (isEditing) {
        await api.put(`/api/products/${product.id}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      onSaved();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="product-form-title" aria-modal="true" className="modal" role="dialog">
        <header className="modal-header">
          <div>
            <p className="eyebrow eyebrow-muted">PRODUCT DETAILS</p>
            <h2 id="product-form-title">{isEditing ? 'Edit product' : 'Add a product'}</h2>
          </div>
          <button aria-label="Close form" className="icon-button" onClick={onClose} title="Close" type="button">
            <X size={19} />
          </button>
        </header>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form className="product-form" onSubmit={handleSubmit}>
          <label htmlFor="product_name">Product name <span className="required-mark">*</span></label>
          <input
            autoFocus
            id="product_name"
            maxLength={100}
            name="product_name"
            onChange={updateField}
            placeholder="e.g. Ceramic travel mug"
            required
            value={values.product_name}
          />
          <label htmlFor="description">Description <span className="optional-label">Optional</span></label>
          <textarea
            id="description"
            name="description"
            onChange={updateField}
            placeholder="A few useful details"
            rows={3}
            value={values.description}
          />
          <div className="form-row">
            <div>
              <label htmlFor="price">Price <span className="required-mark">*</span></label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  id="price"
                  min="0"
                  name="price"
                  onChange={updateField}
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                  value={values.price}
                />
              </div>
            </div>
            <div>
              <label htmlFor="quantity">Quantity <span className="required-mark">*</span></label>
              <input
                id="quantity"
                min="0"
                name="quantity"
                onChange={updateField}
                placeholder="0"
                required
                step="1"
                type="number"
                value={values.quantity}
              />
            </div>
          </div>
          <footer className="form-actions">
            <button className="button button-quiet" onClick={onClose} type="button">Cancel</button>
            <button className="button button-primary" disabled={saving} type="submit">
              {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Add product'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function ProductPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/products');
      setProducts(Array.isArray(data) ? data : []);
      if (!Array.isArray(data)) setError('The API returned an unexpected product list.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.product_name}"? This cannot be undone.`)) return;
    setError('');
    setDeletingId(product.id);
    try {
      await api.delete(`/api/products/${product.id}`);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  async function logout() {
    setLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) await api.post('/api/logout', { refresh_token: refreshToken });
    } catch (requestError) {
      if (requestError.response?.status !== 401) setError(getErrorMessage(requestError));
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      navigate('/login', { replace: true });
    }
  }

  function openNewForm() {
    setActiveProduct(null);
    setShowForm(true);
  }

  function openEditForm(product) {
    setActiveProduct(product);
    setShowForm(true);
  }

  async function refreshAfterSave() {
    setShowForm(false);
    setActiveProduct(null);
    await loadProducts();
  }

  const totalUnits = products.reduce((total, product) => total + Number(product.quantity || 0), 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand brand-dark" href="/products">
          <span className="brand-mark"><Boxes size={18} strokeWidth={2.2} /></span>
          STOCKROOM
        </a>
        <div className="topbar-right">
          <span className="session-label"><span className="status-dot" />Administrator</span>
          <button className="button button-quiet logout-button" disabled={loggingOut} onClick={logout} type="button">
            <LogOut size={16} />{loggingOut ? 'Signing out...' : 'Log out'}
          </button>
        </div>
      </header>

      <section className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow eyebrow-muted">INVENTORY / OVERVIEW</p>
            <h1>Products</h1>
            <p className="page-description">A clear view of what's on your shelves.</p>
          </div>
          <button className="button button-primary add-button" onClick={openNewForm} type="button">
            <CirclePlus size={17} />Add product
          </button>
        </div>

        <div className="summary-strip" aria-label="Inventory summary">
          <div className="summary-item">
            <span className="summary-label">PRODUCTS</span>
            <strong>{loading ? '—' : products.length}</strong>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-label">UNITS IN STOCK</span>
            <strong>{loading ? '—' : totalUnits.toLocaleString()}</strong>
          </div>
          <span className="summary-note"><span className="status-dot" />LIVE INVENTORY</span>
        </div>

        {error && (
          <div className="alert alert-error page-alert" role="alert">
            <span>{error}</span>
            <button className="text-button" onClick={loadProducts} type="button">Refresh list</button>
          </div>
        )}

        <section className="inventory-section" aria-labelledby="inventory-title">
          <div className="section-heading">
            <div>
              <h2 id="inventory-title">All products</h2>
              <p>Manage names, prices, and available quantity.</p>
            </div>
            <button
              aria-label="Refresh products"
              className="icon-button refresh-button"
              disabled={loading}
              onClick={loadProducts}
              title="Refresh products"
              type="button"
            >
              <RotateCw size={17} className={loading ? 'spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state" role="status"><span className="spinner" />Loading products…</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><PackageOpen size={24} /></span>
              <h3>No products yet</h3>
              <p>Add your first product to get the inventory started.</p>
              <button className="button button-primary" onClick={openNewForm} type="button">
                <CirclePlus size={17} />Add product
              </button>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">PRODUCT</th>
                    <th scope="col">PRICE</th>
                    <th scope="col">QUANTITY</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td data-label="Product">
                        <div className="product-cell">
                          <span className="product-glyph"><PackageOpen size={17} /></span>
                          <span>
                            <strong>{product.product_name}</strong>
                            {product.description && <small>{product.description}</small>}
                          </span>
                        </div>
                      </td>
                      <td className="price-cell" data-label="Price">
                        {Number(product.price).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                      </td>
                      <td data-label="Quantity">
                        <span className={`quantity-pill ${Number(product.quantity) === 0 ? 'quantity-empty' : ''}`}>
                          {Number(product.quantity).toLocaleString()} {Number(product.quantity) === 1 ? 'unit' : 'units'}
                        </span>
                      </td>
                      <td className="actions-cell" data-label="Actions">
                        <button
                          aria-label={`Edit ${product.product_name}`}
                          className="icon-button row-action"
                          onClick={() => openEditForm(product)}
                          title="Edit product"
                          type="button"
                        ><Pencil size={16} /></button>
                        <button
                          aria-label={`Delete ${product.product_name}`}
                          className="icon-button row-action row-action-danger"
                          disabled={deletingId === product.id}
                          onClick={() => deleteProduct(product)}
                          title="Delete product"
                          type="button"
                        >{deletingId === product.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <footer className="page-footer">STOCKROOM <span>/</span> PRODUCT MANAGEMENT</footer>
      </section>

      {showForm && (
        <ProductForm
          key={activeProduct?.id || 'new'}
          onClose={() => setShowForm(false)}
          onSaved={refreshAfterSave}
          product={activeProduct}
        />
      )}
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/products"
        element={<ProtectedRoute><ProductPage /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}