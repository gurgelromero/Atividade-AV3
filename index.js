document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const cy = cytoscape({
        container: document.getElementById('cy'),
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)',
                    'background-color': '#666',
                    'text-valign': 'center',
                    'color': '#fff',
                    'text-outline-width': 2,
                    'text-outline-color': '#666'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: 1
        }
    });

    class Vertice {
        constructor(valor) {
            this.valor = valor;
            this.adjacentes = [];
        }
    }

    class Grafo {
        constructor() {
            this.vertices = {};
        }

        adicionarVertice(vertice) {
            this.vertices[vertice.valor] = vertice;
        }

        adicionarAresta(origem, destino, peso) {
            if (!this.vertices[origem.valor] || !this.vertices[destino.valor]) {
                console.error("Vértice de origem ou destino não encontrado no grafo.");
                return;
            }
            this.vertices[origem.valor].adjacentes.push({ vertice: destino, peso });
            this.vertices[destino.valor].adjacentes.push({ vertice: origem, peso }); // Aresta bidirecional
        }

        prim(inicioValor) {
            const chave = {};
            const pai = {};
            const visitados = new Set();
            const fila = new PriorityQueue();

            for (let vertice in this.vertices) {
                chave[vertice] = Infinity;
                pai[vertice] = null;
            }
            chave[inicioValor] = 0;

            fila.enqueue(inicioValor, 0);

            while (!fila.isEmpty()) {
                const { vertice: atualValor } = fila.dequeue();
                visitados.add(atualValor);

                const atualVertice = this.vertices[atualValor];
                for (const { vertice: adjacente, peso } of atualVertice.adjacentes) {
                    if (!visitados.has(adjacente.valor) && peso < chave[adjacente.valor]) {
                        chave[adjacente.valor] = peso;
                        pai[adjacente.valor] = atualValor;
                        fila.enqueue(adjacente.valor, peso);
                    }
                }
            }

            const mst = [];
            for (let vertice in pai) {
                if (pai[vertice]) {
                    mst.push({ origem: pai[vertice], destino: vertice, peso: chave[vertice] });
                }
            }
            return mst;
        }
    }

    class PriorityQueue {
        constructor() {
            this.values = [];
        }

        enqueue(vertice, prioridade) {
            this.values.push({ vertice, prioridade });
            this.sort();
        }

        dequeue() {
            return this.values.shift();
        }

        isEmpty() {
            return this.values.length === 0;
        }

        sort() {
            this.values.sort((a, b) => a.prioridade - b.prioridade);
        }
    }

    const grafo = new Grafo();

    window.adicionarVertice = function() {
        const id = prompt("Digite o ID do novo vértice:");
        console.log(`Prompt returned: ${id}`);
        if (id) {
            const vertice = new Vertice(id);
            console.log('Creating vertex:', vertice);
            grafo.adicionarVertice(vertice);
            cy.add({ data: { id } });
            console.log(`Vértice ${id} adicionado ao grafo e ao Cytoscape.`);
        } else {
            console.log('ID do vértice é inválido.');
        }
    };

    window.removerVertice = function() {
        const id = prompt("Digite o ID do vértice a ser removido:");
        if (id && grafo.vertices[id]) {
            cy.remove(cy.getElementById(id));
            delete grafo.vertices[id];
            console.log(`Vértice ${id} removido.`);
        } else {
            console.log('Vértice não encontrado.');
            alert("Vértice não encontrado.");
        }
    };

    window.adicionarAresta = function() {
        const origem = prompt("Digite o ID do vértice de origem:");
        const destino = prompt("Digite o ID do vértice de destino:");
        const peso = parseFloat(prompt("Digite o peso da aresta:"));

        if (origem && destino && !isNaN(peso) && grafo.vertices[origem] && grafo.vertices[destino]) {
            const verticeOrigem = grafo.vertices[origem];
            const verticeDestino = grafo.vertices[destino];
            grafo.adicionarAresta(verticeOrigem, verticeDestino, peso);
            cy.add({ data: { id: origem + destino, source: origem, target: destino, weight: peso } });
            console.log(`Aresta de ${origem} para ${destino} com peso ${peso} adicionada.`);
        } else {
            console.log('Dados inválidos ou vértices não encontrados.');
            alert("Dados inválidos ou vértices não encontrados.");
        }
    };

    window.removerAresta = function() {
        const id = prompt("Digite o ID da aresta a ser removida (ID é source + target):");
        if (id) {
            const edge = cy.getElementById(id);
            if (edge.length) {
                const source = edge.data('source');
                const target = edge.data('target');
                const origem = grafo.vertices[source];
                origem.adjacentes = origem.adjacentes.filter(adjacente => adjacente.vertice.valor !== target);
                cy.remove(edge);
                console.log(`Aresta ${id} removida.`);
            } else {
                console.log('Aresta não encontrada.');
                alert("Aresta não encontrada.");
            }
        }
    };

    window.calcularMenorCaminho = function() {
        const origem = prompt("Digite o ID do vértice de origem:");
        const destino = prompt("Digite o ID do vértice de destino:");
        if (origem && destino && grafo.vertices[origem] && grafo.vertices[destino]) {
            const distancia = grafo.dijkstra(origem, destino);
            console.log(`A menor distância de ${origem} para ${destino} é ${distancia}.`);
            alert(`A menor distância de ${origem} para ${destino} é ${distancia}.`);
        } else {
            console.log('Dados inválidos ou vértices não encontrados.');
            alert("Dados inválidos ou vértices não encontrados.");
        }
    };

    window.calcularArvoreGeradoraMinima = function() {
        const inicio = prompt("Digite o ID do vértice inicial:");
        if (inicio && grafo.vertices[inicio]) {
            const mst = grafo.prim(inicio);
            cy.elements().remove(); // Remove todas as arestas e vértices do grafo visual
            for (let vertice in grafo.vertices) {
                cy.add({ data: { id: vertice } }); // Adiciona os vértices de volta
            }
            mst.forEach(aresta => {
                cy.add({ data: { id: aresta.origem + aresta.destino, source: aresta.origem, target: aresta.destino, weight: aresta.peso } });
            });
            console.log("Árvore Geradora Mínima calculada e exibida.");
            alert("Árvore Geradora Mínima calculada e exibida.");
        } else {
            console.log('Vértice inicial não encontrado.');
            alert("Vértice inicial não encontrado.");
        }
    };
});
