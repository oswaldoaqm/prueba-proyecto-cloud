package main

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type Modelo struct {
	ModeloID           int     `json:"modelo_id"`
	NombreModelo       string  `json:"nombre_modelo"`
	Version            string  `json:"version"`
	Framework          string  `json:"framework"`
	Estado             string  `json:"estado"`
	DatasetID          int     `json:"dataset_id"`
	FechaEntrenamiento string  `json:"fecha_entrenamiento"`
	Autor              string  `json:"autor"`
	Hiperparametros    string  `json:"hiperparametros"`
}

type Metrica struct {
	MetricaID     int     `json:"metrica_id"`
	ModeloID      int     `json:"modelo_id"`
	TipoMetrica   string  `json:"tipo_metrica"`
	ValorMetrica  float64 `json:"valor_metrica"`
	FechaRegistro string  `json:"fecha_registro"`
}

var db *sql.DB

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func main() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, pass, host, port, name)
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		panic(err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "ms2-model-registry"})
	})

	r.GET("/modelos", func(c *gin.Context) {
		estado := c.Query("estado")
		framework := c.Query("framework")
		limit := c.DefaultQuery("limit", "100")
		skip := c.DefaultQuery("skip", "0")
		lim, _ := strconv.Atoi(limit)
		sk, _ := strconv.Atoi(skip)

		q := "SELECT modelo_id, nombre_modelo, version, framework, estado, dataset_id, fecha_entrenamiento, autor, hiperparametros FROM modelo WHERE 1=1"
		args := []interface{}{}
		if estado != "" {
			q += " AND estado = ?"
			args = append(args, estado)
		}
		if framework != "" {
			q += " AND framework = ?"
			args = append(args, framework)
		}
		q += " LIMIT ? OFFSET ?"
		args = append(args, lim, sk)

		rows, err := db.Query(q, args...)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var modelos []Modelo
		for rows.Next() {
			var m Modelo
			rows.Scan(&m.ModeloID, &m.NombreModelo, &m.Version, &m.Framework, &m.Estado, &m.DatasetID, &m.FechaEntrenamiento, &m.Autor, &m.Hiperparametros)
			modelos = append(modelos, m)
		}
		c.JSON(200, modelos)
	})

	r.GET("/modelos/:id", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		var m Modelo
		err := db.QueryRow("SELECT modelo_id, nombre_modelo, version, framework, estado, dataset_id, fecha_entrenamiento, autor, hiperparametros FROM modelo WHERE modelo_id = ?", id).
			Scan(&m.ModeloID, &m.NombreModelo, &m.Version, &m.Framework, &m.Estado, &m.DatasetID, &m.FechaEntrenamiento, &m.Autor, &m.Hiperparametros)
		if err != nil {
			c.JSON(404, gin.H{"error": "not found"})
			return
		}
		c.JSON(200, m)
	})

	r.GET("/modelos/:id/metricas", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		rows, err := db.Query("SELECT metrica_id, modelo_id, tipo_metrica, valor_metrica, fecha_registro FROM metrica WHERE modelo_id = ?", id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var metricas []Metrica
		for rows.Next() {
			var mt Metrica
			rows.Scan(&mt.MetricaID, &mt.ModeloID, &mt.TipoMetrica, &mt.ValorMetrica, &mt.FechaRegistro)
			metricas = append(metricas, mt)
		}
		c.JSON(200, metricas)
	})

	r.POST("/modelos", func(c *gin.Context) {
		var m Modelo
		if err := c.ShouldBindJSON(&m); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		res, err := db.Exec("INSERT INTO modelo (nombre_modelo, version, framework, estado, dataset_id, fecha_entrenamiento, autor, hiperparametros) VALUES (?,?,?,?,?,?,?,?)",
			m.NombreModelo, m.Version, m.Framework, m.Estado, m.DatasetID, m.FechaEntrenamiento, m.Autor, m.Hiperparametros)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		lid, _ := res.LastInsertId()
		m.ModeloID = int(lid)
		c.JSON(201, m)
	})

	r.PUT("/modelos/:id/estado", func(c *gin.Context) {
		id, _ := strconv.Atoi(c.Param("id"))
		var body struct {
			Estado string `json:"estado"`
		}
		if err := c.ShouldBindJSON(&body); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		_, err := db.Exec("UPDATE modelo SET estado = ? WHERE modelo_id = ?", body.Estado, id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"modelo_id": id, "nuevo_estado": body.Estado})
	})

	r.GET("/modelos/top", func(c *gin.Context) {
		limit := c.DefaultQuery("limit", "5")
		lim, _ := strconv.Atoi(limit)
		q := `
			SELECT m.modelo_id, m.nombre_modelo, m.version, m.framework, AVG(mt.valor_metrica) as avg_accuracy
			FROM modelo m
			JOIN metrica mt ON m.modelo_id = mt.modelo_id
			WHERE mt.tipo_metrica = 'accuracy'
			GROUP BY m.modelo_id, m.nombre_modelo, m.version, m.framework
			ORDER BY avg_accuracy DESC
			LIMIT ?
		`
		rows, err := db.Query(q, lim)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()
		var result []gin.H
		for rows.Next() {
			var m Modelo
			var avg float64
			rows.Scan(&m.ModeloID, &m.NombreModelo, &m.Version, &m.Framework, &avg)
			result = append(result, gin.H{
				"modelo_id":     m.ModeloID,
				"nombre_modelo": m.NombreModelo,
				"version":       m.Version,
				"framework":     m.Framework,
				"avg_accuracy":  avg,
			})
		}
		c.JSON(200, result)
	})

	r.Run(":8080")
}