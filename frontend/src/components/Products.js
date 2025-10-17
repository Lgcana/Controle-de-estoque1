import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Stock from './Stock';
import StockHistory from './StockHistory';

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', quantity: 0, price: 0 });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
  const res = await axios.get('https://controle-de-estoque2-0.onrender.com/api/products');
    setProducts(res.data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      if (editing) {
  await axios.put(`https://controle-de-estoque2-0.onrender.com/api/products/${editing}`, form);
        setMessage('Produto atualizado!');
      } else {
  await axios.post('https://controle-de-estoque2-0.onrender.com/api/products', form);
        setMessage('Produto cadastrado!');
      }
      setForm({ name: '', description: '', quantity: 0, price: 0 });
      setEditing(null);
      fetchProducts();
    } catch {
      setMessage('Erro ao salvar produto');
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Deseja realmente excluir?')) {
  await axios.delete(`https://controle-de-estoque2-0.onrender.com/api/products/${id}`);
      fetchProducts();
    }
  }

  function handleEdit(product) {
    setForm(product);
  setEditing(product.id);
  }

  return (
    <>
      <Stock products={products} onUpdate={fetchProducts} />
      <StockHistory products={products} />
      <div style={{maxWidth:600,margin:'auto'}}>
        <h2 style={{color:'#2d6a4f'}}>Produtos</h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:8,background:'#f1f1f1',padding:16,borderRadius:8}}>
          <input placeholder="Nome" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
          <input placeholder="Descrição" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          <input type="number" placeholder="Quantidade" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:Number(e.target.value)}))} required />
          <button style={{background:'#40916c',color:'#fff',padding:8,border:'none',borderRadius:4}}>{editing ? 'Atualizar' : 'Cadastrar'}</button>
          {editing && <button type="button" onClick={()=>{setEditing(null);setForm({ name: '', description: '', quantity: 0, price: 0 });}}>Cancelar edição</button>}
          {message && <span style={{color:'#40916c'}}>{message}</span>}
        </form>
        <table style={{width:'100%',marginTop:24,background:'#fff',borderRadius:8,boxShadow:'0 2px 8px #ccc'}}>
          <thead>
            <tr style={{background:'#40916c',color:'#fff'}}>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id}>
                <td>{prod.name}</td>
                <td>{prod.description}</td>
                <td>{prod.quantity}</td>
                <td>R$ {prod.price.toFixed(2)}</td>
                <td>
                  <button onClick={()=>handleEdit(prod)} style={{marginRight:8}}>Editar</button>
                  <button onClick={()=>handleDelete(prod.id)} style={{color:'red'}}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Products;
