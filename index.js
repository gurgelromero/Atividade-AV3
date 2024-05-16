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
                    'curve-style': 'bezier',
                    'label': 'data(weight)',
                    'font-size': '12px',
                    'text-valign': 'center',
                    'color': '#333'
                }
            }
            
                
            
        ],
        layout: {
            name: 'cose', // Alterado para 'cose' para uma distribuição automática dos vértices
            animate: true,
            padding: 10,
            fit: true,
            nodeOverlap: 20,
            nodeRepulsion: 4000,
            idealEdgeLength: 100,
            edgeElasticity: 100
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
        
            // Inicializa as chaves e os pais de todos os vértices
            for (let vertice in this.vertices) {
                chave[vertice] = Infinity;
                pai[vertice] = null;
            }
        
            // Inicializa a chave do vértice inicial como 0 e o adiciona à fila de prioridade
            chave[inicioValor] = 0;
            fila.enqueue(inicioValor, 0);
        
            // Enquanto houver vértices na fila de prioridade
            while (!fila.isEmpty()) {
                const { vertice: atualValor } = fila.dequeue();
                visitados.add(atualValor);
        
                const atualVertice = this.vertices[atualValor];
                for (const { vertice: adjacente, peso } of atualVertice.adjacentes) {
                    // Se o vértice adjacente não foi visitado e o peso da aresta é menor que a chave do vértice adjacente
                    if (!visitados.has(adjacente.valor) && peso < chave[adjacente.valor]) {
                        // Atualiza a chave e o pai do vértice adjacente
                        chave[adjacente.valor] = peso;
                        pai[adjacente.valor] = atualValor;
                        // Adiciona o vértice adjacente à fila de prioridade
                        fila.enqueue(adjacente.valor, peso);
                    }
                }
            }
        
            // Constrói a árvore geradora mínima
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

    // Funções para adicionar e remover vértices e arestas
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
    

            

    window.calcularArvoreGeradoraMinima = function() {
        const inicio = prompt("Digite o ID do vértice inicial:");
        if (inicio && grafo.vertices[inicio]) {
            const mst = grafo.prim(inicio);
            const arestasMST = new Set();
            mst.forEach(aresta => {
                arestasMST.add(aresta.origem + aresta.destino);
                arestasMST.add(aresta.destino + aresta.origem);
            });
            cy.edges().forEach(edge => {
                if (arestasMST.has(edge.id())) {
                    edge.style('line-color', 'red'); // Pinta a aresta de vermelho se pertence à MST
                } else {
                    edge.style('line-color', '#ccc'); // Restaura a cor original das outras arestas
                }
            });
            console.log("Arestas pertencentes à Árvore Geradora Mínima pintadas de vermelho.");
            alert("Arestas pertencentes à Árvore Geradora Mínima pintadas de vermelho.");
        } else {
            console.log('Vértice inicial não encontrado.');
            alert("Vértice inicial não encontrado.");
        }
    };
    

    // Adiciona vértices e arestas iniciais
    const verticesIniciais = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const arestasIniciais = [
        { origem: 'A', destino: 'B', peso: 4 },
        { origem: 'A', destino: 'H', peso: 8 },
        { origem: 'A', destino: 'C', peso: 5 },
        { origem: 'B', destino: 'H', peso: 11 },
        { origem: 'B', destino: 'C', peso: 8 },
        { origem: 'B', destino: 'D', peso: 7 },
        { origem: 'C', destino: 'D', peso: 9 },
        { origem: 'C', destino: 'E', peso: 4 },
        { origem: 'D', destino: 'E', peso: 10 },
        { origem: 'E', destino: 'F', peso: 10 },
        { origem: 'F', destino: 'G', peso: 2 },
        { origem: 'G', destino: 'H', peso: 1 },
        { origem: 'G', destino: 'I', peso: 6 },
        { origem: 'H', destino: 'I', peso: 7 },
        { origem: 'A', destino: 'E', peso: 6 },
        { origem: 'C', destino: 'G', peso: 2 },
        { origem: 'B', destino: 'F', peso: 9 }
    ];

    verticesIniciais.forEach(id => {
        const vertice = new Vertice(id);
        grafo.adicionarVertice(vertice);
        cy.add({ data: { id } });
    });

    arestasIniciais.forEach(({ origem, destino, peso }) => {
        const verticeOrigem = grafo.vertices[origem];
        const verticeDestino = grafo.vertices[destino];
        grafo.adicionarAresta(verticeOrigem, verticeDestino, peso);
        cy.add({ data: { id: origem + destino, source: origem, target: destino, weight: peso } });
    });

    cy.layout({ name: 'cose', animate: true }).run(); // Executa o layout após a adição inicial dos vértices e arestas

    console.log("Grafo inicial adicionado.");
});
