-- Rollback: Remover tabelas e funções de rate limiting (se existirem)
-- Execute apenas se você migrou da solução complexa para a simplificada

DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS rate_limit_configs;
DROP FUNCTION IF EXISTS check_rate_limit;
