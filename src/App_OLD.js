import React, { useState } from 'react';
import './App.css';
import peliculas from './data/peliculas.json';

function App() {
  const [input, setInput] = useState('');
  const [peliculasFiltradas, setPeliculasFiltradas] = useState(peliculas);
  const [recomendacionIA, setRecomendacionIA] = useState('');
  const [peliculasRecomendadas, setPeliculasRecomendadas] = useState([]);

  const handleBuscarTexto = () => {
    const texto = input.toLowerCase();
    const filtradas = peliculas.filter((peli) =>
      peli.titulo.toLowerCase().includes(texto) ||
      peli.genero.toLowerCase().includes(texto) ||
      peli.titulo.toLowerCase().startsWith(texto)
    );
    setPeliculasFiltradas(filtradas);
    setPeliculasRecomendadas([]);
    setRecomendacionIA('');
  };

  const handleBuscarDescripcion = async () => {
    setRecomendacionIA('Pensando...');
    setPeliculasRecomendadas([]);
    setPeliculasFiltradas([]);
    
    try {
      const response = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tengo una base de datos con estas películas:
          ${peliculas.map(p => p.titulo).join(', ')}.
          Quiero que me digas solo los títulos de las películas que coincidan con esta
          descripción: "${input}".
          Devuélveme únicamente los títulos separados por comas.`
        }),
      });
      
      const data = await response.json();
      const textoIA = data.recomendacion.toLowerCase();
      setRecomendacionIA(data.recomendacion);
      
      const coincidencias = peliculas.filter((peli) =>
        textoIA.includes(peli.titulo.toLowerCase())
      );
      setPeliculasRecomendadas(coincidencias);
      
    } catch (err) {
      setRecomendacionIA('Error al obtener recomendación IA.');
      console.error('Error:', err);
    }
  };

  return (
    <div className="App">
      <h1 className="titulo">CECYFLIX</h1>

      <div className="buscador">
        <input
          type="text"
          placeholder="¿Qué te gustaría ver hoy?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button onClick={handleBuscarTexto}>Buscar</button>
        <button onClick={handleBuscarDescripcion} className="btn-ia">
          Buscar por descripción
        </button>
      </div>

      {recomendacionIA && (
        <div className="bloque-recomendaciones">
          <h2>Recomendación IA</h2>
          <p>{recomendacionIA}</p>
        </div>
      )}

      {peliculasRecomendadas.length > 0 && (
        <div className="galeria">
          <h2>Películas recomendadas por IA</h2>
          <div className="grid">
            {peliculasRecomendadas.map((peli) => (
              <div className="tarjeta" key={peli.id}>
                <img src={peli.poster} alt={peli.titulo} />
                <div className="info">
                  <h3>{peli.titulo}</h3>
                  <p>{peli.descripcion}</p>
                  <span>{peli.genero}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {peliculasFiltradas.length > 0 && (
        <div className="galeria">
          <h2>Todas las películas</h2>
          <div className="grid">
            {peliculasFiltradas.map((peli) => (
              <div className="tarjeta" key={peli.id}>
                <img src={peli.poster} alt={peli.titulo} />
                <div className="info">
                  <h3>{peli.titulo}</h3>
                  <p>{peli.descripcion}</p>
                  <span>{peli.genero}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;