import { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

export default function App() {
  const [nomes, setNomes] = useState("");
  const [resultado, setResultado] = useState([]);

  const cores = ["Verde", "Rosa", "Amarelo", "Azul"];
  const coresHex = {
    Verde: "#2E8B57",
    Rosa: "#FF69B4",
    Amarelo: "#FFD700",
    Azul: "#1E90FF",
  };

  const textoCor = {
    Verde: "#ffffff",
    Rosa: "#ffffff",
    Amarelo: "#000000",
    Azul: "#ffffff",
  };

  // 🔹 Função genérica de sorteio
  function sortear(lista) {
    const sorteio = [];
    let i = 0;
    for (const pessoa of lista) {
      const cor = cores[i % cores.length];
      sorteio.push({ ...pessoa, cor });
      i++;
    }
    return sorteio.sort(() => Math.random() - 0.5);
  }

  // 🔹 Sortear geral
  function sortearCores() {
    const lista = parseEntrada();
    if (lista.length === 0) {
      alert("Adicione nomes antes de sortear!");
      return;
    }
    setResultado(sortear(lista));
  }

  // 🔹 Sortear por gênero (F e M separados)
  function sortearPorGenero() {
    const lista = parseEntrada();
    if (lista.length === 0) {
      alert("Adicione nomes antes de sortear!");
      return;
    }

    const feminino = lista.filter((p) => p.genero.toUpperCase() === "F");
    const masculino = lista.filter((p) => p.genero.toUpperCase() === "M");

    const resultadoFinal = [...sortear(feminino), ...sortear(masculino)];
    setResultado(resultadoFinal);
  }

  // 🔹 Converte a entrada em objetos
  function parseEntrada() {
    return nomes
      .split("\n")
      .map((linha) => linha.trim())
      .filter((linha) => linha !== "")
      .map((linha) => {
        const partes = linha.split("-").map((p) => p.trim());
        return {
          nome: partes[0] || "",
          modelo: partes[1] || "",
          tamanho: partes[2] || "",
          genero: partes[3] || "",
        };
      });
  }

  // 🔹 TXT sem o gênero
  function baixarTXT() {
    const texto = resultado
      .map(
        (r, i) =>
          `${i + 1} - ${r.nome} - ${r.modelo} - ${r.tamanho} - ${r.cor}`
      )
      .join("\n");
    const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sorteio.txt";
    link.click();
  }

  // 🔹 Excel com colunas formatadas
  function baixarExcel() {
    const dados = resultado.map((r, i) => ({
      Nº: i + 1,
      Nome: r.nome,
      Modelo: r.modelo,
      Tamanho: r.tamanho,
      Cor: r.cor,
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sorteio");
    XLSX.writeFile(wb, "sorteio.xlsx");
  }

  return (
    <div className="app-container">
      <h1 className="titulo">🎨 Sorteio de Cores</h1>

      <textarea
        className="area-texto"
        placeholder="Digite: nome - modelo - tamanho - gênero (F ou M)"
        value={nomes}
        onChange={(e) => setNomes(e.target.value)}
      />

      <div className="botoes">
        <button onClick={sortearCores}>Sortear Geral</button>
        <button onClick={sortearPorGenero}>Sortear por Gênero</button>
        <button onClick={baixarTXT}>Baixar TXT</button>
        <button onClick={baixarExcel}>Baixar Excel</button>
      </div>

      {resultado.length > 0 && (
        <table className="tabela">
          <thead>
            <tr>
              <th>№</th>
              <th>Nome</th>
              <th>Modelo</th>
              <th>Tamanho</th>
              <th>Cor</th>
            </tr>
          </thead>
          <tbody>
            {resultado.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: coresHex[r.cor],
                  color: textoCor[r.cor],
                }}
              >
                <td>{i + 1}</td>
                <td>{r.nome}</td>
                <td>{r.modelo}</td>
                <td>{r.tamanho}</td>
                <td>{r.cor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
