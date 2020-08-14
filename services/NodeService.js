const dbAccess = require('../database/dbAccess');
const NodeRepository = require('../database/repositories/NodeRepository');

const db = new dbAccess('./assets/database/database.sqlite3');
const Node = new NodeRepository(db);

const { BrowserWindow } = require('electron');

var entry;
var logs = [];

const handleLogs = log => {
    logs.push(log);
    BrowserWindow.getFocusedWindow().webContents.send('logs:add', logs);
};

const handleResponses = log => {
    logs.push(log);
    BrowserWindow.getFocusedWindow().webContents.send('logs:response', logs);
};

const getNodes = async () => {
    var nodes = await Node.getAll();
    BrowserWindow.getFocusedWindow().webContents.send('musics:get', nodes);
};

const handleNodes = async () => {
    BrowserWindow.getFocusedWindow().webContents.send('handle:nodes');
};

const succ = async newEntry => {
    logs = [];
    entry = newEntry;
    var startNode = await Node.getActiveNode();
    const { id } = startNode;
    var node = startNode;
    var verifyNode = matchNode(node);

    if(!verifyNode) {
        node.id = null;
        while(node.id !== id) {
            node = await findNextActiveNode(node.next_node);
            verifyNode = matchNode(node);
    
            if(verifyNode) {
                break;
            }
        }
    }

    if(verifyNode) {
        handleLogs(`entry found on node ${node.id}`);
        return true;
    } else {
        handleLogs(`entry not found`);
        return false;
    }
};

const findNextActiveNode = async node => {
    var activeNode

    handleLogs(`pinging node ${node}`);
    activeNode = await Node.getByNode(node);
    
    if(activeNode.active) {
        handleLogs(`node ${node} answered`);
        return activeNode;
    } else {
        handleLogs(`node ${node} didn't answered`);
        return findNextActiveNode(activeNode.next_node);
    }
};

const matchNode = node => {
    if(node.value.toLowerCase() === entry.toLowerCase() || node.id === parseInt(entry)) {
        return true;
    }

    return false;
};

const addNode = newNode => {
    logs = [];
    Node.create(newNode.name, newNode.mac, 1, false)
        .then(newNode => {
            handleResponses('node created with success');
            Node.getLastNode()
                .then(node => {
                    node.next_node = newNode.id;
                    Node.update(node)
                        .then(() => { 
                            handleResponses('node index updated');
                            handleNodes();
                        })
                        .catch(err => {
                            handleResponses('error on update nodes index');
                            console.log(err);
                        });
                });
        })
        .catch(err => {
            handleResponses('error on create a new node');
            console.log(err);
        });
};

const removeNode = nodeId => {
    logs = [];
    Node.getById(nodeId)
        .then(node => {
            const { next_node } = node;
            Node.delete(nodeId)
                .then(() => {
                    handleResponses(`node ${nodeId} delete with success`);
                    handleNodes();
                })
                .catch(err => {
                    handleResponses(`error on delete node ${nodeId}`);
                    console.log(err);
                });
            
            Node.getByNextNode(nodeId)
                .then(predecessor => {
                    predecessor.next_node = next_node;
                    Node.update(predecessor)
                        .then(() => { 
                            handleResponses('node index updated');
                            handleNodes();
                        })
                        .catch(err => {
                            handleResponses('error on update nodes index');
                            console.log(err);
                        });
                })
                .catch(err => {
                    handleResponses('error on update nodes index');
                    console.log(err);
                });
        })
        .catch(err => {
            handleResponses(`error on delete node ${nodeId}`);
            console.log(err);
        });
    
}

const changeNodeStatus = nodeId => {
    Node.getById(nodeId)
        .then(node => {
            Node.setActive(node.id, !node.active)
                .then(() => {
                    handleResponses('node updated');
                    handleNodes();
                })
                .catch(err => {
                    handleResponses('error on update node');
                    console.log(err);
                });
        })
        .catch(err => {
            handleResponses(`error on set node active`);
            console.log(err);
        });
};

module.exports = {
    succ,
    addNode,
    removeNode,
    changeNodeStatus,
    getNodes,
};