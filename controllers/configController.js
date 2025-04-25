const fs = require('fs');// Módulo para leitura de arquivos
const path = './config.json';// Módulo para manipulação de caminhos de arquivos

//Função para ler o arquivo JSON
const readJSON = () => {
    const data = fs.readFileSync(path, 'utf-8'); // Lê o conteúdo do arquivo
    return JSON.parse(data); // Converte o conteúdo para um objeto JavaScript
}

// Função para escrever no JSON
const writeJSON = (data) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2)); // Converte o objeto para JSON e escreve no arquivo
}

//Função para obter os valor das variáveis do JSON
const getGlobalRepeat = (req, res) => {
    const data = readJSON();
    res.json({ globalRepeat: data.globalRepeat }); // Retorna o valor de globalRepeat    
}

const getMin = (req, res) => {
    const data = readJSON();
    res.json({ min: data.min }); // Retorna o valor de min
}

const getMax = (req, res) => {
    const data = readJSON();
    res.json({ max: data.max }); // Retorna o valor de max
}

//Função para atualizar o valor de globalRepeat
const updateGlobalRepeat = (req, res) => {
    const { globalRepeat } = req.body;
    const numericGlobalRepeat = Number(globalRepeat); // Converte o valor para número
    if (isNaN(numericGlobalRepeat)) {
        return res.status(400).json({ message: 'O valor de globalRepeat precisa ser numérico' });
    }
    
        const data = readJSON();
        data.globalRepeat = numericGlobalRepeat; // Atualiza o valor de globalRepeat
        writeJSON(data); // Escreve o novo valor no arquivo JSON
        res.status(200).json({ message: 'globalRepeat atualizado com sucesso', globalRepeat }); // Retorna o novo valor de globalRepeat
    
}

//Função para atualizar o valor de Min
const updateMin = (req, res) => {
    const { min } = req.body;    
    const numericMin = Number(min); // Converte o valor para número
    if (isNaN(numericMin)) {
        return res.status(400).json({ message: 'O valor de min precisa ser numérico' });
    }
        const data = readJSON();
        data.min = numericMin; // Atualiza o valor de Min
        writeJSON(data); // Escreve o novo valor no arquivo JSON
        res.status(200).json({ message: 'min atualizado com sucesso', min }); // Retorna o novo valor de Min   
}

//Função para atualizar o valor de Max
const updateMax = (req, res) => {
    const { max } = req.body;   
    const numericMax = Number(max); // Converte o valor para número
    if (isNaN(numericMax)) {
        return res.status(400).json({ message: 'O valor de max precisa ser numérico' });
    } 
        const data = readJSON();
        data.max = numericMax; // Atualiza o valor de Max
        writeJSON(data); // Escreve o novo valor no arquivo JSON
        res.status(200).json({ message: 'max atualizado com sucesso', max }); // Retorna o novo valor de Max    
}
//Exporta as funções para serem usadas em outros arquivos
module.exports = {
    getGlobalRepeat,
    getMin,
    getMax,
    updateGlobalRepeat,
    updateMin,
    updateMax
}