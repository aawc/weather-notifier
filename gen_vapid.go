package main

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
)

func main() {
	// Generate P-256 key
	priv, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Fatal(err)
	}

	// Private key is just the D value
	dBytes := priv.D.Bytes()
	// Pad to 32 bytes if needed
	if len(dBytes) < 32 {
		dBytes = append(make([]byte, 32-len(dBytes)), dBytes...)
	}
	privBase64 := base64.RawURLEncoding.EncodeToString(dBytes)

	// Public key is 0x04 + X + Y
	xBytes := priv.PublicKey.X.Bytes()
	yBytes := priv.PublicKey.Y.Bytes()
	// Pad to 32 bytes if needed
	if len(xBytes) < 32 {
		xBytes = append(make([]byte, 32-len(xBytes)), xBytes...)
	}
	if len(yBytes) < 32 {
		yBytes = append(make([]byte, 32-len(yBytes)), yBytes...)
	}

	pubBytes := append([]byte{0x04}, xBytes...)
	pubBytes = append(pubBytes, yBytes...)
	pubBase64 := base64.RawURLEncoding.EncodeToString(pubBytes)

	fmt.Println("VAPID Public Key (base64url):", pubBase64)
	fmt.Println("VAPID Private Key (base64url):", privBase64)
}
