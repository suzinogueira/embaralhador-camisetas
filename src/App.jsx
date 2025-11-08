import React, { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const cores = ["Verde", "Azul", "Amarelo", "Rosa"];
const coresHomem = ["Verde", "Azul", "Amarelo"];

function App() {
  const [texto, setTexto] = useState("");
  const [dados, setDados] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState("");

  // --- Parse da lista ---
  const parseDados = () => {
    const linhas = texto.split("\n").filter(l => l.trim() !== "");
    const parsed = linhas.map(linha => {
      const partes = linha.split(" - ").map(p => p.trim());
      if (partes.length < 4) return null;
      const [nome, modelo, tamanho, genero] = partes;
      return { nome, modelo, tamanho, genero: genero.toUpperCase(), cor: "" };
    }).filter(Boolean);
    setDados(parsed);
  };

  // --- Embaralhar array (algoritmo de Fisher-Yates) ---
  const embaralharArray = arr => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // --- Distribuir cores 100% equilibradas ---
  const distribuirCoresEquilibradas = (lista, coresDisponiveis) => {
    const total = lista.length;
    const numCores = coresDisponiveis.length;
    const qtdPorCorBase = Math.floor(total / numCores);
    let resto = total % numCores;

    const coresDistribuidas = [];

    // Cada cor recebe a quantidade base
    coresDisponiveis.forEach(c => {
      for (let i = 0; i < qtdPorCorBase; i++) coresDistribuidas.push(c);
    });

    // Caso haja resto, distribuir 1 para cada cor até acabar
    let i = 0;
    while (resto > 0) {
      coresDistribuidas.push(coresDisponiveis[i % numCores]);
      resto--;
      i++;
    }

    // Embaralhar a lista de cores
    return embaralharArray(coresDistribuidas).slice(0, total);
  };

  // --- Sorteio geral ---
  const sortearGeral = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");
    const coresDistribuidas = distribuirCoresEquilibradas(dados, cores);
    const dadosAtualizados = dados.map((p, i) => ({
      ...p,
      cor: coresDistribuidas[i],
      numero: i + 1
    }));
    setDados(dadosAtualizados);
  };

  // --- Sorteio por gênero ---
  const sortearPorGenero = () => {
    if (dados.length === 0) return alert("Carregue a lista primeiro!");

    const homens = dados.filter(p => p.genero === "M");
    const mulheres = dados.filter(p => p.genero === "F");

    const coresH = distribuirCoresEquilibradas(homens, coresHomem);
    const coresF = distribuirCoresEquilibradas(mulheres, cores);

    const homensFinal = homens.map((p, i) => ({
      ...p,
      cor: coresH[i],
    }));

    const mulheresFinal = mulheres.map((p, i) => ({
      ...p,
      cor: coresF[i],
    }));

    // Junta e adiciona numeração geral
    const combinado = [...homensFinal, ...mulheresFinal].map((p, i) => ({
      ...p,
      numero: i + 1
    }));

    setDados(combinado);
  };

  // --- Baixar TXT ---
  const baixarTXT = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const linhas = dados.map(d =>
      `${d.numero} - ${d.nome} - ${d.modelo} - ${d.tamanho} - ${d.genero} - ${d.cor}`
    ).join("\n");
    const blob = new Blob([linhas], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "camisetas.txt");
  };

  // --- Baixar Excel ---
  const baixarExcel = () => {
    if (dados.length === 0) return alert("Não há dados para baixar!");
    const ws = XLSX.utils.json_to_sheet(
      dados.map(d => ({
        Nº: d.numero,
        Nome: d.nome,
        Modelo: d.modelo,
        Tamanho: d.tamanho,
        Gênero: d.genero,
        Cor: d.cor
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Camisetas");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "camisetas.xlsx");
  };

  // --- Ordenar tabela ---
  const ordenarTabela = coluna => {
    let novaLista = [...dados];
    novaLista.sort((a, b) => {
      if (a[coluna] < b[coluna]) return -1;
      if (a[coluna] > b[coluna]) return 1;
      return 0;
    });
    setDados(novaLista);
    setOrdenarPor(coluna);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🎁 Embaralhador de Camisetas</h1>
      <textarea
        rows={10}
        cols={50}
        placeholder="Cole a lista aqui (Nome - Modelo - Tamanho - F/M)"
        value={texto}
        onChange={e => setTexto(e.target.value)}
      />
      <br /><br />
      <button onClick={parseDados}>Carregar Lista</button>
      <button onClick={sortearGeral}>Sortear Geral</button>
      <button onClick={sortearPorGenero}>Sortear por Gênero</button>
      <button onClick={baixarTXT}>Baixar TXT</button>
      <button onClick={baixarExcel}>Baixar Excel</button>
      <br /><br />
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            {["numero", "nome", "modelo", "tamanho", "genero", "cor"].map(col => (
              <th
                key={col}
                onClick={() => ordenarTabela(col)}
                style={{ cursor: "pointer" }}
              >
                {col.toUpperCase()} {ordenarPor === col ? "▼" : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((p, idx) => (
            <tr key={idx}>
              <td>{p.numero}</td>
              <td>{p.nome}</td>
              <td>{p.modelo}</td>
              <td>{p.tamanho}</td>
              <td>{p.genero}</td>
              <td
                style={{
                  width: "80px",
                  textAlign: "center",
                  backgroundColor: p.cor ? p.cor.toLowerCase() : "transparent",
                  color: p.cor === "Amarelo" ? "#000" : "#fff",
                  border: "1px solid #000"
                }}
              >
                {p.cor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
