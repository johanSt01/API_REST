import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    TIPO_DE_LOG: { type: String, index: true },
    METODO_HTTP: String,
    APLICACION: String,
    MODULO: String,
    FECHA: { type: Date, index: true },
    ACCION: String
});

const Log = mongoose.model('Log', logSchema);

export default Log;