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