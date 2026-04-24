FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod main.go ./
RUN go mod tidy
RUN go build -o server .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]