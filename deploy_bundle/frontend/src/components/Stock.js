import React, { useState } from 'react';
import axios from 'axios';

function Stock({ products, onUpdate }) {
  const [selected, setSelected] = useState('');
  const [type, setType] = useState('entrada');
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');

  async function handleMove(e) {
    e.preventDefault();
    setMessage('');
    if (!selected || quantity <= 0) return setMessage('Preencha todos os campos');
    try {
  await axios.post(`https://controle-de-estoque2-0.onrender.com/api/stock/${selected}/move`, { type, quantity });
      setMessage('Movimentação registrada!');
      setQuantity(0);
      onUpdate && onUpdate();
    } catch {
      setMessage('Erro ao movimentar estoque');
    }
  }

  return (
    <div style={{maxWidth:600,margin:'32px auto',background:'#f8f9fa',padding:16,borderRadius:8}}>
      <h2 style={{color:'#457b9d'}}>Movimentação de Estoque</h2>
      <form onSubmit={handleMove} style={{display:'flex',gap:8,alignItems:'center'}}>
        <select value={selected} onChange={e=>setSelected(e.target.value)} required style={{flex:2}}>
          <option value="">Selecione o produto</option>
          {products.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <select value={type} onChange={e=>setType(e.target.value)} style={{flex:1}}>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <input type="number" min={1} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} placeholder="Quantidade" style={{flex:1}} required />
        <button style={{background:'#457b9d',color:'#fff',padding:8,border:'none',borderRadius:4}}>Registrar</button>
      </form>
      {message && <span style={{color:'#457b9d'}}>{message}</span>}
    </div>
  );
}

export default Stock;
