from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from datetime import datetime
import requests  # Agrega esta línea para importar la biblioteca requests

class HealthCheckHandler(BaseHTTPRequestHandler):
    
    def do_GET(self):
        if self.path == '/health/live':
            response_data = health.run_liveness()
        elif self.path == '/health/ready':
            response_data = health.run_readiness()
        elif self.path == '/health':
            response_data = health.run()
        else:
            self.send_response(404)
            self.end_headers()
            return
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())

class HealthCheck:
    def __init__(self):
        self.user_service_url = "http://localhost:3000/health"
        self.log_service_url = "http://localhost:5005/health"
    
    def check_user_service(self):
        try:
            response = requests.get(self.user_service_url)
            if response.status_code == 200:
                return "UP"
            else:
                return "DOWN"
        except Exception as e:
            print("Error:", e)
            return "DOWN"

    def check_log_service(self):
        try:
            response = requests.get(self.log_service_url)
            if response.status_code == 200:
                return "UP"
            else:
                return "DOWN"
        except Exception as e:
            print("Error:", e)
            return "DOWN"

    def run_liveness(self):
        user_service_status = self.check_user_service()
        log_service_status = self.check_log_service()
        return self._format_response("Liveness check", user_service_status, log_service_status)

    def run_readiness(self):
        user_service_status = self.check_user_service()
        log_service_status = self.check_log_service()
        return self._format_response("Readiness check", user_service_status, log_service_status)
    
    def run(self):
        liveness_results = self.run_liveness()
        readiness_results = self.run_readiness()
        return {'status': 'UP', 'checks': [liveness_results, readiness_results]}

    def _format_response(self, name, user_service_status, log_service_status):
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
                }
            ]
        }
        return response

health = HealthCheck()

if __name__ == '__main__':
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, HealthCheckHandler)
    print('Server running at http://localhost:8000')
    httpd.serve_forever()
