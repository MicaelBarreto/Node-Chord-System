const Promise = require('bluebird');
const dbAccess = require('../database/dbAccess');
const NodeRepository = require('../database/repositories/NodeRepository');
const fs = require('fs');

const db = new dbAccess('./assets/database/database.sqlite3');
const Node = new NodeRepository(db);

Node.dropTable()
    .then(() => {
        Node.createTable()
            .then(() => {
                console.log('Creating Nodes ...');

                var musics = fs.readFileSync('./assets/musics', 'utf8');
                musics = musics.split(/\r?\n/);

                return Promise.all(musics.map((music, index) => {
                    var mac = generateMacAddress();

                    if(index === 39) {
                        index = 1;
                    } else {
                        index += 2;
                    }

                    return Node.create(music, mac, index, false)
                }));
            })
            .then(() => {
                console.log('Creating Active Nodes ...');
                var activeNodes = generateRandomActiveNode();

                return Promise.all(activeNodes.map(node => {
                    return Node.setActive(node, true);
                }));
            })
            // .then(() => Node.getAll())
            // .then(nodes => console.log(nodes))
            .catch(err => {
                console.log('error');
                console.log(err);
            });
    })
    .catch(err => {
        console.log('error');
        console.log(err);
    });


const generateMacAddress = () => (
    "XX:XX:XX:XX:XX:XX".replace(/X/g, function() {
        return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16));
    })
);

const generateRandomActiveNode = () => {
    var rands = [];
    var number;

    while(rands.length < 8) {
        number = Math.floor(
            Math.random() * (40 - 1) + 1
        );

        if(!rands.includes(number)) {
            rands.push(number);
        }
    }

    return rands;
};