// Import the Spinner component into this file and test
// that it renders what it should for the different props it can take.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import LoginForm from './LoginForm';
import Spinner from './Spinner';
import Message from './Message';
import Articles from './Articles';
import ArticleForm from './ArticleForm';


// test('sanity', () => {
//   expect(true).toBe(false)
// })

test('LoginForm calls login function on form submission', () => {
  const login = jest.fn();
  render(<LoginForm login={login} />);

  const usernameInput = screen.getByPlaceholderText(/enter username/i);
  const passwordInput = screen.getByPlaceholderText(/enter password/i);

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

  const submitButton = screen.getByText(/submit credentials/i);
  fireEvent.click(submitButton);

  expect(login).toHaveBeenCalledWith({ username: 'testuser', password: 'testpassword' });
});

test('Spinner renders correctly based on props', () => {
  const { rerender } = render(<Spinner on={true} />);
  expect(screen.getByText(/please wait/i)).toBeInTheDocument();

  rerender(<Spinner on={false} />);
  expect(screen.queryByText(/please wait/i)).not.toBeInTheDocument();
});

test('Message renders the correct message', () => {
  render(<Message message="Test message" />);
  expect(screen.getByText(/test message/i)).toBeInTheDocument();
});

test('Articles renders correctly based on props', () => {
  const articles = [
    { article_id: 1, title: 'Test Title 1', text: 'Test Text 1', topic: 'React' },
    { article_id: 2, title: 'Test Title 2', text: 'Test Text 2', topic: 'JavaScript' },
  ];

  const getArticles = jest.fn();
  const deleteArticle = jest.fn();
  const setCurrentArticleId = jest.fn();

  render(
    <Articles
      articles={articles}
      getArticles={getArticles}
      deleteArticle={deleteArticle}
      setCurrentArticleId={setCurrentArticleId}
      currentArticleId={null}
    />
  );

  expect(screen.getByText(/test title 1/i)).toBeInTheDocument();
  expect(screen.getByText(/test title 2/i)).toBeInTheDocument();
  expect(screen.queryByText(/no articles yet/i)).not.toBeInTheDocument();

  render(
    <Articles
      articles={[]}
      getArticles={getArticles}
      deleteArticle={deleteArticle}
      setCurrentArticleId={setCurrentArticleId}
      currentArticleId={null}
    />
  );

  expect(screen.getByText(/no articles yet/i)).toBeInTheDocument();
});

test('ArticleForm calls postArticle or updateArticle based on props', () => {
  const postArticle = jest.fn();
  const updateArticle = jest.fn();
  const setCurrentArticleId = jest.fn();

  const { rerender } = render(
    <ArticleForm
      postArticle={postArticle}
      updateArticle={updateArticle}
      setCurrentArticleId={setCurrentArticleId}
      currentArticle={null}
    />
  );

  fireEvent.change(screen.getByPlaceholderText(/enter title/i), { target: { value: 'New Title' } });
  fireEvent.change(screen.getByPlaceholderText(/enter text/i), { target: { value: 'New Text' } });
  fireEvent.change(screen.getByDisplayValue('-- Select topic --'), { target: { value: 'React' } });

  fireEvent.click(screen.getByText(/submit/i));

  expect(postArticle).toHaveBeenCalledWith({
    title: 'New Title',
    text: 'New Text',
    topic: 'React',
  });

  const currentArticle = { article_id: 1, title: 'Edit Title', text: 'Edit Text', topic: 'React' };

  rerender(
    <ArticleForm
      postArticle={postArticle}
      updateArticle={updateArticle}
      setCurrentArticleId={setCurrentArticleId}
      currentArticle={currentArticle}
    />
  );

  fireEvent.click(screen.getByText(/submit/i));

  expect(updateArticle).toHaveBeenCalledWith({
    article_id: 1,
    article: {
      title: 'Edit Title',
      text: 'Edit Text',
      topic: 'React',
    },
  });
});

test('Full application works as expected', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  const usernameInput = screen.getByPlaceholderText(/enter username/i);
  const passwordInput = screen.getByPlaceholderText(/enter password/i);
  const submitButton = screen.getByText(/submit credentials/i);

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/articles/i)).toBeInTheDocument();
  });

  expect(screen.getByText(/testuser/i)).toBeInTheDocument();
});
