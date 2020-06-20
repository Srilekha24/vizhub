import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { BehaviorSubject } from 'rxjs';
import { switchMap, debounceTime, tap } from 'rxjs/operators';
import { Avatar } from '../Avatar';
import { fetchUserSearchResults } from './fetchUserSearchResults';
import { Container, UserPreview, UserName } from './styles';

const fetchData = async (typedText) => {
  if (!typedText) return [];
  const results = await fetchUserSearchResults(typedText);
  return results.users;
};

const debounceTimeMS = 500;
const listSize = 8;

export const UserPreviewList = ({
  query,
  onBeforeShowSuggestions,
  onSelect,
}) => {
  const typedText$ = useMemo(() => new BehaviorSubject(), []);
  useEffect(() => {
    if (query) {
      typedText$.next(query);
      setResults([]);
    }
  }, [typedText$, query]);

  const [results, setResults] = useState([]);
  const results$ = useMemo(() => {
    const operators = [debounceTime(debounceTimeMS), switchMap(fetchData)];
    if (onBeforeShowSuggestions) {
      operators.push(tap(onBeforeShowSuggestions));
    }
    return typedText$.pipe(...operators);
  }, [onBeforeShowSuggestions, typedText$]);
  useEffect(() => {
    const subscription = results$.subscribe(setResults);
    return () => subscription.unsubscribe();
  }, [results$]);

  const handleClick = useCallback(
    (user) => {
      onSelect(user);
      setResults([]);
    },
    [onSelect]
  );

  return (
    <Container>
      {results && results.slice(0, listSize).map((user) => (
        <UserPreview key={user.userName} onClick={() => handleClick(user)}>
          <Avatar size={24} user={user} isDisabled={true} />
          <UserName>{user.fullName}</UserName>
        </UserPreview>
      ))}
      {
        results && results.length > listSize && (
          <UserPreview>
            +{results.length - listSize} users
          </UserPreview>
        )
      }
    </Container>
  );
};
