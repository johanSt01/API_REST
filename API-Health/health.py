from flask import Flask, request, jsonify
import requests
from datetime import datetime
import os
import logging

# Configuraciones
NOTIFICATION_URL = os.getenv("NOTIFICATION_URL", "http://localhost:5001/send-notification")
SERVICES = {
    "user_service": os.getenv("USER_SERVICE_URL", "http://localhost:3000/health"),
    "log_service": os.getenv("LOG_SERVICE_URL", "http://localhost:5005/health"),
    "profile_service": os.getenv("PROFILE_SERVICE_URL", "http://localhost:4000/health"),
    "gateway_service": os.getenv("GATEWAY_SERVICE_URL", "http://localhost:5000/health"),
}

# Configuración de logs
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = Flask(__name__)
registered_microservices = {}

def send_notification(service_name):
    url = "http://api_notify:5001/send-notification"  # Cambiar localhost por api_notify
    payload = {"serviceName": service_name}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("Notificación enviada correctamente")
        else:
            print("Error al enviar la notificación:", response.text)
    except Exception as e:
        print("Error al enviar la notificación:", e)

def check_service_health(url, service_name):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return "UP"
        else:
            send_notification(service_name)
            return "DOWN"
    except requests.RequestException as e:
        logging.error(f"Error al consultar el servicio {service_name}: {e}")
        send_notification(service_name)
        return "DOWN"

def check_all_services():
    results = {}
    for name, url in SERVICES.items():
        results[name] = check_service_health(url, name)
    return results

@app.route('/health/live', methods=['GET'])
def liveness_check():
    status = check_all_services()
    return jsonify(format_response("Liveness check", status))

@app.route('/health/ready', methods=['GET'])
def readiness_check():
    status = check_all_services()
    return jsonify(format_response("Readiness check", status))

@app.route('/register_microservice', methods=['POST'])
def register_microservice():
    data = request.get_json()
    required_fields = ["name", "endpoint", "frequency", "emails"]
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Faltan campos requeridos"}), 400

    name = data["name"]
    if name in registered_microservices:
        return jsonify({"message": "El microservicio ya está registrado"}), 400

    registered_microservices[name] = {
        "endpoint": data["endpoint"],
        "frequency": data["frequency"],
        "emails": data["emails"]
    }
    logging.info(f"Microservicio registrado: {name}")
    return jsonify({"message": f"Microservicio '{name}' registrado correctamente."}), 201

@app.route('/health/<service_name>', methods=['GET'])
def get_service_health(service_name):
    if service_name in registered_microservices:
        service_info = registered_microservices[service_name]
        status = check_service_health(service_info['endpoint'], service_name)
        return jsonify({"name": service_name, "status": status})
    else:
        return jsonify({"message": "Microservicio no registrado"}), 404

def format_response(name, status_dict):
    checks = [
        {
            "name": service_name,
            "status": status,
            "data": {
                "from": datetime.now().isoformat(),
                "status": status
            }
        }
        for service_name, status in status_dict.items()
    ]
    return {
        "name": name,
        "status": "UP" if all(s == "UP" for s in status_dict.values()) else "DOWN",
        "checks": checks
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
