# github-actions-store-sqs-config-ssm
Github action for storing files in ssm

## Inputs

### `file-path`
**Required** The path to the file
### `base64`
**Required** Encode the file in base64? Default `False`
### `ssm-path`
**Required** SSM path to store the file content

## Example usage

```yaml
        uses: bisnow/github-actions-store-sqs-config-ssm@v1.1
        with:
          file-path: ./deploy/${{ env.ENVIRONMENT }}/etc/sqs-worker.conf
          base64: 'true'
          ssm-path: '/${{ env.ECS_SERVICE }}/${{ env.ENVIRONMENT }}/sqs_config'
```

## Making changes

edit `index.js` 

Install ncc if you don't have it

`npm i -g @vercel/ncc`

Compile JS
`ncc build index.js --license LICENSE `