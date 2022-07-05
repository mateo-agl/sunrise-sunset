import React from "react";
import { ReactComponent as SearchBtn } from "../assets/search.svg";
import { Form, Button, ListGroup, Col, Row } from "react-bootstrap";

export const Search = ({ getMatches, getLocation, handleInput, city: { matches }, reset }) => (
    <Row xs="auto" className="mx-1 mt-2">
        <Col className="d-flex p-0 position-relative">
            <Form.Control
                className="rounded-0 rounded-start"
                onChange={handleInput}
                placeholder="City name"
                onBlur={e => !e.relatedTarget && reset()}
                onKeyDown={e => e.key === "Enter" && getMatches()}
            />
            <Button 
                className="rounded-0 rounded-end"
                variant="secondary"
                onClick={getMatches}
            >
                <SearchBtn/>
            </Button>
            <ListGroup as="ul" className="position-absolute top-100 w-100" tabIndex={-1}>
                {
                    matches.map((c, i) => (
                        c === "No matches found"
                            ? <ListGroup.Item as="li" key={i}>
                                <label>{c}</label>
                            </ListGroup.Item>
                            : <ListGroup.Item
                                as="li"
                                key={i}
                                onClick={() => getLocation(c)}
                            >
                                <label>{`${c.name}, ${c.countryCode}`}</label>
                            </ListGroup.Item>
                    ))
                }
            </ListGroup>
        </Col>
    </Row>
);