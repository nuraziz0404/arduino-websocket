// Library: WebSockets
// by: Marcus Sattler
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <Hash.h>

WebSocketsClient webSocket;

int sensorPin = D0;
int state = 0;
int matic = 1;
int sensor;
int command;

#define id 1304
#define SSID "Aziz"
#define PASS ""
// #define server "192.168.43.126"
// #define port 8019
#define server "jemuran01.herokuapp.com"
#define port 80

void handler(String cmd)
{
	if (cmd == "jemur")
	{
		command = 1;
		matic = 0;
	}
	else if (cmd == "teduh")
	{
		command = 0;
		matic = 0;
	}
	else if (cmd == "matic")
	{
		matic = 1;
	}
	else if (cmd == "exists")
	{
		Serial.println("server exists, standby until restart");
		webSocket.disconnect();
	}
}
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{

	switch (type)
	{
	case WStype_DISCONNECTED:
		Serial.printf("[WSc] Disconnected!\n");
		break;
	case WStype_CONNECTED:
		Serial.printf("[WSc] Connected to url: %s\n", payload);
		// send message to server when Connected
		webSocket.sendTXT(("server " + String(id) + " set").c_str());
		break;
	case WStype_TEXT:
		// Serial.printf("[WSc] get text: %s\n", payload);
		// sx = "Dari arduino: ";

		// webSocket.sendTXT(sx.c_str());
		handler((char *)payload);

		// send message to server
		// webSocket.sendTXT("message here");
		break;
		//		 case WStype_PING:
		// 	// pong will be send automatically
		//		 	Serial.printf("[WSc] get ping\n");
		// 	break;
		// case WStype_PONG:
		// 	// answer to a ping we send
		// 	Serial.printf("[WSc] get pong\n");
		// 	break;
	}
}

void setup()
{
	// Serial.begin(921600);
	Serial.begin(115200);
	delay(10);
	// Serial.setDebugOutput(true);
	Serial.println();

	WiFi.begin(SSID, PASS);
	Serial.print("Connecting...");
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(100);
		Serial.print(".");
	}
	Serial.println("\nConnected");
	Serial.print("IP: ");
	Serial.println(WiFi.localIP());

	// server address, port and URL
	webSocket.begin(server, port, "/");
	// webSocket.beginSSL(server, port, "/");
	// webSocket.beginSslWithCA(server, port, "/");

	// event handler
	webSocket.onEvent(webSocketEvent);

	// try ever 5000 again if connection has failed
	webSocket.setReconnectInterval(5000);
	webSocket.enableHeartbeat(15000, 3000, 2);

	pinMode(LED_BUILTIN, OUTPUT);
	pinMode(sensorPin, INPUT);

	sensor = digitalRead(sensorPin);
	state = sensor;
	digitalWrite(LED_BUILTIN, !state);
}

void loop()
{
	webSocket.loop();
	sensor = digitalRead(sensorPin);
	int wsStatus = webSocket.isConnected();
	if (wsStatus) {
		if (!sensor){
			state = sensor;
		}
		else {
			if (matic) {
				state = sensor;
				// delay(1000);
			}
			else {
				state = command;
			}
		}
		webSocket.sendTXT(("server " + String(id) + " send " + (state ? "DIJEMUR" : "NGEYUP")).c_str());
		webSocket.sendTXT(("server " + String(id) + " cuaca " + (sensor ? "cerah" : "hujan")).c_str());
	}
	else {
		// delay(1000);
		matic = 1;
		state = sensor;
	}

	// Serial.println("mode: " + String(matic ? "matic" : "manual"));
	digitalWrite(LED_BUILTIN, !state);
}
