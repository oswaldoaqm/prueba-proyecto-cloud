package com.utec.mlops;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class RegistryController {

    private final JdbcTemplate jdbcTemplate;

    public RegistryController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Modelo> modeloMapper = (rs, rowNum) -> {
        Modelo m = new Modelo();
        m.modeloId = rs.getInt("modelo_id");
        m.nombreModelo = rs.getString("nombre_modelo");
        m.version = rs.getString("version");
        m.framework = rs.getString("framework");
        m.estado = rs.getString("estado");
        m.datasetId = rs.getInt("dataset_id");
        m.fechaEntrenamiento = rs.getString("fecha_entrenamiento");
        m.autor = rs.getString("autor");
        m.hiperparametros = rs.getString("hiperparametros");
        return m;
    };

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "ms2-java-registry");
    }

    @GetMapping("/modelos")
    public List<Modelo> getModelos(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String framework,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        
        String sql = "SELECT * FROM modelo WHERE 1=1";
        List<Object> args = new ArrayList<>();
        if (estado != null && !estado.isEmpty()) { sql += " AND estado = ?"; args.add(estado); }
        if (framework != null && !framework.isEmpty()) { sql += " AND framework = ?"; args.add(framework); }
        sql += " LIMIT ? OFFSET ?";
        args.add(limit);
        args.add(skip);
        return jdbcTemplate.query(sql, modeloMapper, args.toArray());
    }

    @GetMapping("/modelos/{id}")
    public ResponseEntity<Modelo> getModelo(@PathVariable int id) {
        List<Modelo> result = jdbcTemplate.query("SELECT * FROM modelo WHERE modelo_id = ?", modeloMapper, id);
        return result.isEmpty() ? ResponseEntity.notFound().build() : ResponseEntity.ok(result.get(0));
    }

    @GetMapping("/modelos/{id}/metricas")
    public List<Map<String, Object>> getMetricas(@PathVariable int id) {
        return jdbcTemplate.queryForList("SELECT * FROM metrica WHERE modelo_id = ?", id);
    }

    @PostMapping("/modelos")
    public ResponseEntity<Modelo> create(@RequestBody Modelo m) {
        String sql = "INSERT INTO modelo (nombre_modelo, version, framework, estado, dataset_id, fecha_entrenamiento, autor, hiperparametros) VALUES (?,?,?,?,?,?,?,?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, m.nombreModelo);
            ps.setString(2, m.version);
            ps.setString(3, m.framework);
            ps.setString(4, m.estado);
            ps.setObject(5, m.datasetId);
            ps.setString(6, m.fechaEntrenamiento);
            ps.setString(7, m.autor);
            ps.setString(8, m.hiperparametros);
            return ps;
        }, keyHolder);
        m.modeloId = keyHolder.getKey().intValue();
        return ResponseEntity.status(201).body(m);
    }

    @PutMapping("/modelos/{id}/estado")
    public Map<String, Object> updateEstado(@PathVariable int id, @RequestBody Map<String, String> body) {
        jdbcTemplate.update("UPDATE modelo SET estado = ? WHERE modelo_id = ?", body.get("estado"), id);
        return Map.of("modelo_id", id, "nuevo_estado", body.get("estado"));
    }

    @GetMapping("/modelos/top")
    public List<Map<String, Object>> getTop(@RequestParam(defaultValue = "5") int limit) {
        String sql = "SELECT m.modelo_id, m.nombre_modelo, m.version, m.framework, AVG(mt.valor_metrica) as avg_accuracy " +
                     "FROM modelo m JOIN metrica mt ON m.modelo_id = mt.modelo_id " +
                     "WHERE mt.tipo_metrica = 'accuracy' GROUP BY m.modelo_id ORDER BY avg_accuracy DESC LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }
}