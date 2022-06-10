import { ReactComponent as SearchBtn } from "../assets/search.svg";
import { Form, Button, ListGroup, Col, Row } from 'react-bootstrap';

export const Search = ({ getMatches, getLocation, handleInput, city: { name, matches } }) => {
    const search = () => getMatches();
    const selectCity = city => getLocation(city._links["city:item"].href);
    const handleEnter = e => e.key === "Enter" && search();
    return (
        <>
            <Row sm="auto" className="px-3 mt-2">
                <Col className="p-0">
                    <Form.Control
                        className="rounded-0 rounded-start"
                        onChange={handleInput}
                        value={name}
                        placeholder="City name"
                        onKeyDown={handleEnter}
                    />
                </Col>
                <Col className="p-0">
                    <Button 
                        className="rounded-0 rounded-end"
                        variant="secondary"
                        onClick={search}
                    >
                        <SearchBtn/>
                    </Button>
                </Col>
            </Row>
            <ListGroup as="ul" className="position-absolute">
                {
                    matches.map((c, i) => (
                        c === "No matches found"
                            ? <ListGroup.Item as="li" key={i}>
                                <label>{c}</label>
                            </ListGroup.Item>
                            : <ListGroup.Item
                                as="li"
                                key={i}
                                onClick={() => selectCity(c)}
                            >
                                <label>{c.matching_full_name}</label>
                            </ListGroup.Item>
                    ))
                }
            </ListGroup>
        </>
    )
};