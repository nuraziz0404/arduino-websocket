// Library: WebSockets
// by: Marcus Sattler
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <Hash.h>

WebSocketsClient webSocket;

int state = 0;

#define id 1304
#define SSID "Aziz"
#define PASS ""
// #define server "192.168.43.126" 
// #define port 80
#define server "47.250.52.121" 
#define port 8019

void handler(String cmd)
{
	if (cmd == "jemur")
	{
		state = 1;
	}
	else if (cmd == "teduh")
	{
		state = 0;
	}
	else if(cmd == "exists") {
		Serial.println("server exists, standby until restart");
		while (1);
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
	{
		Serial.printf("[WSc] Connected to url: %s\n", payload);
		// send message to server when Connected
		webSocket.sendTXT(("server "+String(id)+" set").c_str());
	}
	break;
	case WStype_TEXT:
		// Serial.printf("[WSc] get text: %s\n", payload);
		// sx = "Dari arduino: ";

		// webSocket.sendTXT(sx.c_str());
		handler((char *)payload);

		// send message to server
		// webSocket.sendTXT("message here");
		break;
		 case WStype_PING:
		// 	// pong will be send automatically
		 	Serial.printf("[WSc] get ping\n");
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
	//Serial.setDebugOutput(true);
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
	digitalWrite(LED_BUILTIN, 1);
 pinMode(D0, OUTPUT);
  digitalWrite(D0, 0);
}

void loop()
{
	digitalWrite(LED_BUILTIN, !state);
  digitalWrite(D0, state);
	webSocket.loop();
	webSocket.sendTXT(("server "+String(id)+" send "+ (state ? "DIJEMUR" : "NGEYUP")).c_str());
}
