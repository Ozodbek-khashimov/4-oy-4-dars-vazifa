import http from 'node:http';
import url from 'node:url';

let phones = [
    { id: 1, name: 'Galaxy S24 ultra', brand: 'Samsung', price: 1200, stock: 100 },
    { id: 2, name: 'iPhone 16 pro max', brand: 'apple', price: 1300, stock: 100 },
    { id: 3, name: 'redmi note 14', brand: 'mi', price: 500, stock: 100 }
];

let server = http.createServer((req, res) => {
    let parseurl = url.parse(req.url, true);
    let path = parseurl.pathname;
    let method = req.method;
    let query = parseurl.query;
    res.setHeader('Content-Type', 'application/json');

    if (path === '/phones' && method === 'GET') {
        let filterPhones = phones;
        if (query.brand) {
            filterPhones = filterPhones.filter(phone => phone.brand.toLocaleLowerCase() === query.brand.toLocaleLowerCase());
        }
        if (query.maxPrice) {
            filterPhones = filterPhones.filter(phone => phone.price <= parseFloat(query.maxPrice));
        }
        res.writeHead(200);
        res.end(JSON.stringify(filterPhones));
    } else if (path.startsWith('/phones/') && method === 'GET') {
        let id = parseInt(path.split('/')[2]);
        let phone = phones.find(phone => phone.id === id);

        if (phone) {
            res.writeHead(200);
            res.end(JSON.stringify(phone));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Phone not found' }));
        }
    } else if (path === '/phones' && method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                let { name, brand, price, stock } = JSON.parse(body);
                if (!name || !brand || !price || !stock) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid input data' }));
                    return;
                }
                let newPhone = {
                    id: phones.length + 1,
                    name,
                    brand,
                    price,
                    stock
                };
                phones.push(newPhone);
                res.writeHead(201);
                res.end(JSON.stringify(newPhone));
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else if (path.startsWith('/phones/') && method === 'PUT') {
        let id = parseInt(path.split('/')[2]);
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                let updateData = JSON.parse(body);
                let phone = phones.find(phone => phone.id === id);
                if (!phone) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Phone not found' }));
                    return;
                }
                Object.assign(phone, updateData);
                res.writeHead(200);
                res.end(JSON.stringify(phone));
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid input data' }));
            }
        });
    } else if (path.startsWith('/phones/') && method === 'DELETE') {
        let id = parseInt(path.split('/')[2]);
        let index = phones.findIndex(p => p.id === id);
        if (index === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Phone not found' }));
        } else {
            let deletePhone = phones.splice(index, 1)[0];
            res.writeHead(200);
            res.end(JSON.stringify(deletePhone));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
