import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Package, Users, ShoppingCart, AlertTriangle, Trash2, Save, Edit3, X, Plus } from "lucide-react";
import { api } from "./api";
import "./styles.css";

const emptyProduct = { name: "", sku: "", price: "", quantity: "" };
const emptyCustomer = { full_name: "", email: "", phone: "" };

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
}

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ total_products: 0, total_customers: 0, total_orders: 0, low_stock_products: 0 });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState(null);
  const [orderForm, setOrderForm] = useState({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [dashboard, productList, customerList, orderList] = await Promise.all([
        api.dashboard(),
        api.products(),
        api.customers(),
        api.orders(),
      ]);
      setSummary(dashboard);
      setProducts(productList);
      setCustomers(customerList);
      setOrders(orderList);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  async function submitProduct(event) {
    event.preventDefault();
    const payload = {
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      price: Number(productForm.price),
      quantity: Number(productForm.quantity),
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        setNotice({ type: "success", text: "Product updated" });
      } else {
        await api.createProduct(payload);
        setNotice({ type: "success", text: "Product added" });
      }
      setProductForm(emptyProduct);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  async function submitCustomer(event) {
    event.preventDefault();
    try {
      await api.createCustomer({
        full_name: customerForm.full_name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
      });
      setCustomerForm(emptyCustomer);
      setNotice({ type: "success", text: "Customer added" });
      await loadData();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    try {
      await api.createOrder({
        customer_id: Number(orderForm.customer_id),
        items: orderForm.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      });
      setOrderForm({ customer_id: "", items: [{ product_id: "", quantity: 1 }] });
      setNotice({ type: "success", text: "Order created and stock updated" });
      await loadData();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  function updateOrderItem(index, changes) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item)),
    }));
  }

  function addOrderItem() {
    setOrderForm((current) => ({
      ...current,
      items: [...current.items, { product_id: "", quantity: 1 }],
    }));
  }

  function removeOrderItem(index) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function editProduct(product) {
    setEditingId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
  }

  async function remove(type, id) {
    try {
      if (type === "product") await api.deleteProduct(id);
      if (type === "customer") await api.deleteCustomer(id);
      if (type === "order") {
        await api.deleteOrder(id);
        setSelectedOrder(null);
      }
      setNotice({ type: "success", text: "Deleted successfully" });
      await loadData();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventory & Order Management</p>
          <h1>Operations Console</h1>
        </div>
        <button className="ghost" onClick={loadData}>Refresh</button>
      </header>

      {notice && (
        <div className={`notice ${notice.type}`} role="status">
          <span>{notice.text}</span>
          <button aria-label="Dismiss notice" onClick={() => setNotice(null)}><X size={16} /></button>
        </div>
      )}

      <section className="metrics">
        <Metric icon={<Package />} label="Products" value={summary.total_products} />
        <Metric icon={<Users />} label="Customers" value={summary.total_customers} />
        <Metric icon={<ShoppingCart />} label="Orders" value={summary.total_orders} />
        <Metric icon={<AlertTriangle />} label="Low Stock" value={summary.low_stock_products} />
      </section>

      <section className="grid">
        <Panel title={editingId ? "Update Product" : "Add Product"}>
          <form className="form" onSubmit={submitProduct}>
            <input required placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            <input required placeholder="SKU/code" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
            <div className="split">
              <input required min="0.01" step="0.01" type="number" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
              <input required min="0" type="number" placeholder="Stock" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
            </div>
            <button className="primary" type="submit"><Save size={17} />{editingId ? "Save Changes" : "Add Product"}</button>
          </form>
        </Panel>

        <Panel title="Add Customer">
          <form className="form" onSubmit={submitCustomer}>
            <input required placeholder="Full name" value={customerForm.full_name} onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })} />
            <input required type="email" placeholder="Email address" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
            <input required placeholder="Phone number" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
            <button className="primary" type="submit"><Save size={17} />Add Customer</button>
          </form>
        </Panel>

        <Panel title="Create Order">
          <form className="form" onSubmit={submitOrder}>
            <select required value={orderForm.customer_id} onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
            </select>
            {orderForm.items.map((item, index) => {
              const selected = productById.get(Number(item.product_id));
              return (
                <div className="order-line" key={index}>
                  <select required value={item.product_id} onChange={(e) => updateOrderItem(index, { product_id: e.target.value })}>
                    <option value="">Select product</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.quantity} in stock)</option>)}
                  </select>
                  <input required min="1" max={selected?.quantity || undefined} type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateOrderItem(index, { quantity: e.target.value })} />
                  <button className="icon-button" type="button" aria-label="Remove order item" disabled={orderForm.items.length === 1} onClick={() => removeOrderItem(index)}><Trash2 size={16} /></button>
                </div>
              );
            })}
            <button className="secondary" type="button" onClick={addOrderItem}><Plus size={17} />Add Item</button>
            <button className="primary" type="submit"><ShoppingCart size={17} />Create Order</button>
          </form>
        </Panel>
      </section>

      <section className="tables">
        <DataBlock title="Products">
          <table>
            <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{currency(product.price)}</td>
                  <td><span className={product.quantity <= 5 ? "pill warn" : "pill"}>{product.quantity}</span></td>
                  <td className="actions">
                    <button aria-label="Edit product" onClick={() => editProduct(product)}><Edit3 size={16} /></button>
                    <button aria-label="Delete product" onClick={() => remove("product", product.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataBlock>

        <DataBlock title="Customers">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td className="actions"><button aria-label="Delete customer" onClick={() => remove("customer", customer.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataBlock>

        <DataBlock title="Orders">
          <table>
            <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Items</th><th></th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="clickable">
                  <td>#{order.id}</td>
                  <td>{order.customer.full_name}</td>
                  <td>{currency(order.total_amount)}</td>
                  <td>{order.items.length}</td>
                  <td className="actions"><button aria-label="Delete order" onClick={(event) => { event.stopPropagation(); remove("order", order.id); }}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataBlock>
      </section>

      {selectedOrder && (
        <aside className="drawer">
          <button className="close" aria-label="Close order details" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
          <h2>Order #{selectedOrder.id}</h2>
          <p>{selectedOrder.customer.full_name} · {currency(selectedOrder.total_amount)}</p>
          {selectedOrder.items.map((item) => (
            <div className="line" key={item.id}>
              <span>{item.product.name}</span>
              <strong>{item.quantity} × {currency(item.unit_price)}</strong>
            </div>
          ))}
        </aside>
      )}

      {loading && <div className="loading">Loading...</div>}
    </main>
  );
}

function Metric({ icon, label, value }) {
  return <article className="metric">{icon}<span>{label}</span><strong>{value}</strong></article>;
}

function Panel({ title, children }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function DataBlock({ title, children }) {
  return <section className="data-block"><h2>{title}</h2>{children}</section>;
}

createRoot(document.getElementById("root")).render(<App />);
