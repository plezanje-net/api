DROP SCHEMA public CASCADE; 
CREATE SCHEMA public;

--
-- Name: slovenian; Type: COLLATION; Schema: public; Owner: plezanjenet
--

CREATE COLLATION public.slovenian (provider = icu, locale = 'sl-SI');


ALTER COLLATION public.slovenian OWNER TO plezanjenet;

--
-- Name: utf8_slovenian_ci; Type: COLLATION; Schema: public; Owner: plezanjenet
--

CREATE COLLATION public.utf8_slovenian_ci (provider = icu, locale = 'sl-SI');


ALTER COLLATION public.utf8_slovenian_ci OWNER TO plezanjenet;

--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
