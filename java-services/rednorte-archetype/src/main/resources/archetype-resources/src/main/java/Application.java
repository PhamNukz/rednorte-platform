#set( $className = ${serviceName.substring(0,1).toUpperCase()} + ${serviceName.substring(1)} )
package ${package};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio RedNorte — ${serviceName}.
 * Generado con rednorte-archetype v1.0.0
 */
@SpringBootApplication
public class ${className}Application {
    public static void main(String[] args) {
        SpringApplication.run(${className}Application.class, args);
    }
}
