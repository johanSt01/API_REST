from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from datetime import datetime
import requests  

def send_notification(service_name):
    url = "http://localhost:5001/send-notification"
    payload = {"serviceName": service_name}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("Notificación enviada correctamente")
        else:
            print("Error al enviar la notificación:", response.text)
    except Exception as e:
        print("Error al enviar la notificación:", e)

class HealthCheckHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == '/health/live':
            response_data = health.run_liveness()
        elif self.path == '/health/ready':
            response_data = health.run_readiness()
        elif self.path == '/health':
            response_data = health.run()
        elif self.path.startswith('/health/'):
            # Obtener el nombre del microservicio de la URL
            microservice_name = self.path.split('/')[-1]
            # Lógica para obtener el estado de salud del microservicio especificado
            response_data = self.get_health_status(microservice_name)
        else:
            self.send_response(404)
            self.end_headers()
            return
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

    def do_POST(self):
        if self.path == '/register_microservice':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            post_data_dict = json.loads(post_data)

            # Lógica para registrar el microservicio utilizando los datos recibidos en post_data_dict
            response_data = self.register_microservice(post_data_dict)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def register_microservice(self, data):
        # Se espera que el argumento data sea un diccionario con las claves 'name', 'endpoint', 'frequency' y 'emails'
        name = data.get('name')
        endpoint = data.get('endpoint')
        frequency = data.get('frequency')
        emails = data.get('emails')

        if name and endpoint and frequency and emails:
            health.register_microservice(name, endpoint, frequency, emails)
            return {'message': f"Microservicio '{name}' registrado correctamente."}
        else:
            return {'message': 'Falta información para registrar el microservicio.'}

    def get_health_status(self, name):
        return health.get_health_status(name)


class HealthCheck:
    def __init__(self):
        self.user_service_url = "http://localhost:3000/health"
        self.log_service_url = "http://localhost:5005/health"
        self.profile_service_url = "http://localhost:4000/health"
        self.GETWAY_service_url = "http://localhost:5000/health"


        self.registered_microservices = {}

    def check_user_service(self):
        try:
            response = requests.get(self.user_service_url)
            if response.status_code == 200:
                return "UP"
            else:
                send_notification("de usuarios")
                return "DOWN"
        except Exception as e:
            print("Error:", e)
            send_notification("de usuarios")
            return "DOWN"

    def check_log_service(self):
        try:
            response = requests.get(self.log_service_url)
            if response.status_code == 200:
                return "UP"
            else:
                send_notification("de log")
                return "DOWN"
        except Exception as e:
            print("Error:", e)
            send_notification("de log")
            return "DOWN"

    def check_profile_service(self):
        try:
            response = requests.get(self.profile_service_url)
            if response.status_code == 200:
                return "UP"
            else:
                send_notification(" de perfiles")
                return "DOWN"
        except Exception as e:
            print("Error:", e)
            send_notification(" de perfiles")
            return "DOWN"
        
    def check_GETWAY(self):
        try:
            response = requests.get(self.GETWAY_service_url)
            if response.status_code == 200:
                return "UP"
            else:
                send_notification("gateway")
                return "DOWN"
        except Exception as e:
            print("Error:", e)
            send_notification("gateway")
            return "DOWN"

    def run_liveness(self):
        user_service_status = self.check_user_service()
        log_service_status = self.check_log_service()
        profile_service_status = self.check_profile_service()
        GETWAY_service_status = self.check_GETWAY()
        return self._format_response("Liveness check", user_service_status, log_service_status, profile_service_status, GETWAY_service_status)

    def run_readiness(self):
        user_service_status = self.check_user_service()
        log_service_status = self.check_log_service()
        profile_service_status = self.check_profile_service()
        GETWAY_service_status = self.check_GETWAY()
        return self._format_response("Readiness check", user_service_status, log_service_status, profile_service_status, GETWAY_service_status)
    
    def run(self):
        liveness_results = self.run_liveness()
        readiness_results = self.run_readiness()
        return {'status': 'UP', 'checks': [liveness_results, readiness_results]}

    def _format_response(self, name, user_service_status, log_service_status, profile_service_status, GETWAY_service_status):
        response = {
            'name': name,
            'status': 'UP',
            'checks': [
                {
                    'name': "Manejo de usuarios",
                    'status': user_service_status,
                    'data': {
                        'from': datetime.now().isoformat(),
                        'status': user_service_status
                    }
                },
                {
                    'name': "Manejo de logs",
                    'status': log_service_status,
                    'data': {
                        'from': datetime.now().isoformat(),
                        'status': log_service_status
                    }
                },
                {
                    'name': "Manejo de Perfiles",
                    'status': profile_service_status,
                    'data': {
                        'from': datetime.now().isoformat(),
                        'status': profile_service_status
                    }
                },
                {
                    'name': "API-GETWAY",
                    'status': GETWAY_service_status,
                    'data': {
                        'from': datetime.now().isoformat(),
                        'status': GETWAY_service_status
                    }
                }
            ]
        }
        return response

    def register_microservice(self, name, endpoint, frequency, emails):
        self.registered_microservices[name] = {
            'endpoint': endpoint,
            'frequency': frequency,
            'emails': emails
        }

    def get_all_health_status(self):
        health_status = {}
        for name, info in self.registered_microservices.items():
            response = requests.get(info['endpoint'])
            if response.status_code == 200:
                health_status[name] = 'UP'
            else:
                health_status[name] = 'DOWN'
        return health_status

    def get_health_status(self, name):
        if name in self.registered_microservices:
            info = self.registered_microservices[name]
            response = requests.get(info['endpoint'])
            if response.status_code == 200:
                return {'name': name, 'status': 'UP'}
            else:
                return {'name': name, 'status': 'DOWN'}
        else:
            return {'name': name, 'status': 'Microservicio no registrado'}

health = HealthCheck()

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, HealthCheckHandler)
    print('Server running at http://localhost:8000')
    httpd.serve_forever()
